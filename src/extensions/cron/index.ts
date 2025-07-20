import { ethers } from 'ethers';
import erc20Abi from './abi/erc20.json';

const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
const usdt = new ethers.Contract(
  process.env.USDT_ADDRESS!,
  erc20Abi,
  provider
) as any;

export default {
  // 每 15 秒扫一次
  '*/15 * * * * *': async ({ strapi }) => {
    const store = strapi.store({ type: 'plugin', name: 'chain-scanner' });
    const last = (await store.get({ key: 'lastBlock' })) || await provider.getBlockNumber() - 5;
    const toBlock = await provider.getBlockNumber() - Number(process.env.CONFIRMATIONS);
    if (toBlock <= last) return;

    const logs = await usdt.queryFilter('Transfer', last + 1, toBlock);
    const iface = new ethers.Interface([
      'event Transfer(address indexed from,address indexed to,uint value)'
    ]);
    
    const parsed = logs
      .map(l => {
        try {
          return iface.parseLog(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const addresses = parsed.map(p => p!.args[1].toLowerCase());
    const D = strapi.db.query('api::deposit-address.deposit-address');
    const addrMap = await D.findMany({ where: { address: { $in: addresses } } });

    for (const log of logs) {
      try {
        const parsed = iface.parseLog(log);
        const dst = parsed.args[1].toLowerCase();
        const rec = addrMap.find(a => a.address.toLowerCase() === dst);
        if (!rec) continue; // 不是我们的地址

        const amount = ethers.formatUnits(parsed.args[2], 18);
        const txHash = log.transactionHash;

        // 幂等检查
        const exists = await strapi.db.query('api::recharge-record.recharge-record')
          .findOne({ where: { txHash } });
        if (exists) continue;

        // 1) 写充值记录
        await strapi.db.query('api::recharge-record.recharge-record')
          .create({ data: { user: rec.user, amountUSDT: amount, txHash, status: 'success' } });

        // 2) 加余额 + 流水
        await strapi.service('api::wallet-balance.wallet-balance')
          .add(rec.user, amount, { txType: 'deposit', direction: 'in', txHash, status: 'success' });

        strapi.log.info(`USDT deposit ${amount} => user ${rec.user}`);
      } catch (error) {
        strapi.log.error('Error processing log:', error);
      }
    }
    await store.set({ key: 'lastBlock', value: toBlock });
  },

  // 每 30 秒处理待提现
  '*/30 * * * * *': async ({ strapi }) => {
    const W = strapi.db.query('api::usdt-withdraw.usdt-withdraw');
    const pendings = await W.findMany({ where: { status: 'pending' }, limit: 20 });

    if (!pendings.length) return;
    const signer = new ethers.Wallet(process.env.HOT_WALLET_PRIVKEY!, provider);
    const gasPrice = ethers.parseUnits(process.env.GAS_PRICE_GWEI!, 'gwei');

    for (const p of pendings) {
      try {
        // 使用合约的transfer方法
        const tx = await (usdt as any).connect(signer).transfer(
          p.toAddress,
          ethers.parseUnits(p.amountUSDT, 18),
          { gasPrice }
        );
        await W.update({ where: { id: p.id }, data: { txHash: tx.hash, status: 'sent' } });
      } catch (e) {
        await W.update({ where: { id: p.id }, data: { status: 'failed' } });
        strapi.log.error(e);
      }
    }
  },
}; 