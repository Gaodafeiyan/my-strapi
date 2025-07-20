import Web3 from 'web3';
// @ts-ignore
import { Strapi } from '@strapi/strapi';

// USDT合约地址 (BSC网络)
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// USDT合约ABI (只包含Transfer事件)
const USDT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

interface DepositAddress {
  id: number;
  user: { id: number };
  address: string;
  asset: string;
}

interface WalletTx {
  user_id: number;
  tx_type: 'deposit';
  direction: 'in';
  amount: string;
  tx_hash: string;
  status: 'success';
  asset: string;
  chain: string;
}

interface RechargeRecord {
  user: { id: number };
  amount: string;
  fromAddress: string;
  toAddress: string;
  status: 'pending' | 'confirmed';
  txHash?: string;
  blockNumber?: number;
  confirmedAt?: Date;
}

class BSCDepositListener {
  private web3: Web3;
  private usdtContract: any;
  private lastProcessedBlock: number = 0;
  private strapi: Strapi;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
    this.web3 = new Web3('https://bsc-dataseed.binance.org/');
    this.usdtContract = new this.web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
  }

  async execute() {
    try {
      console.log('🔍 开始检查BSC充值交易...');
      
      // 获取最新区块
      const latestBlock = await this.web3.eth.getBlockNumber();
      
      if (this.lastProcessedBlock === 0) {
        // 第一次运行，从最新区块开始
        this.lastProcessedBlock = Number(latestBlock) - 1;
      }

      const fromBlock = this.lastProcessedBlock + 1;
      const toBlock = latestBlock;

      if (fromBlock > toBlock) {
        console.log('📊 没有新区块需要检查');
        return;
      }

      console.log(`📦 检查区块范围: ${fromBlock} - ${toBlock}`);

      // 获取所有活跃的收款钱包地址
      const platformWallets = await this.strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
        filters: {
          tokenType: 'USDT',
          chain: 'BSC',
          isActive: true
        }
      }) as any[];

      if (platformWallets.length === 0) {
        console.log('⚠️ 没有找到活跃的USDT收款钱包');
        return;
      }

      const walletAddresses = platformWallets.map(wallet => wallet.address.toLowerCase());
      console.log(`🎯 监听地址: ${walletAddresses.join(', ')}`);

      // 获取Transfer事件日志
      const logs = await this.usdtContract.getPastEvents('Transfer', {
        fromBlock: fromBlock,
        toBlock: toBlock
      });

      // 过滤到我们钱包地址的转账
      const relevantLogs = logs.filter(log => 
        walletAddresses.includes(log.returnValues.to.toLowerCase())
      );

      console.log(`💰 发现 ${relevantLogs.length} 个相关转账事件`);

      for (const log of relevantLogs) {
        await this.processTransferEvent(log);
      }

      this.lastProcessedBlock = Number(toBlock);
      console.log('✅ BSC充值监听完成');

    } catch (error) {
      console.error('❌ BSC充值监听错误:', error);
    }
  }

  private async processTransferEvent(event: any) {
    try {
      const { from, to, value } = event.returnValues;
      const amount = this.web3.utils.fromWei(value, 'ether'); // USDT有18位小数
      const txHash = event.transactionHash;
      const blockNumber = event.blockNumber;

      console.log(`💰 处理转账: ${from} → ${to}, 金额: ${amount} USDT, 交易哈希: ${txHash}`);

      // 检查是否已处理过此交易
      const existingTx = await this.strapi.entityService.findMany('api::wallet-tx.wallet-tx' as any, {
        filters: {
          tx_hash: txHash
        }
      }) as any[];

      if (existingTx.length > 0) {
        console.log(`⚠️ 交易 ${txHash} 已处理过，跳过`);
        return;
      }

      // 查找对应的充值地址
      const depositAddress = await this.findDepositAddress(to);
      if (!depositAddress) {
        console.log(`⚠️ 未找到地址 ${to} 对应的充值记录`);
        return;
      }

      // 创建钱包交易记录
      const walletTx = await this.createWalletTx(depositAddress.user.id, amount, txHash, blockNumber);

      // 更新用户余额
      await this.updateUserBalance(depositAddress.user.id, amount);

      // 创建充值记录
      await this.createRechargeRecord(depositAddress.user.id, amount, from, to, txHash, blockNumber);

      // 发送Socket通知
      await this.sendSocketNotification(depositAddress.user.id, amount, txHash);

      console.log(`✅ 充值处理完成: 用户 ${depositAddress.user.id}, 金额 ${amount} USDT`);

    } catch (error) {
      console.error('处理转账事件错误:', error);
    }
  }

  private async findDepositAddress(address: string): Promise<DepositAddress | null> {
    try {
      const addresses = await this.strapi.entityService.findMany('api::deposit-address.deposit-address' as any, {
        filters: {
          address: address.toLowerCase(),
          asset: 'USDT'
        },
        populate: ['user']
      }) as DepositAddress[];

      return addresses.length > 0 ? addresses[0] : null;
    } catch (error) {
      console.error('查找充值地址错误:', error);
      return null;
    }
  }

  private async createWalletTx(userId: number, amount: string, txHash: string, blockNumber: number): Promise<any> {
    try {
      return await this.strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          user_id: userId,
          tx_type: 'deposit',
          direction: 'in',
          amount: amount,
          tx_hash: txHash,
          status: 'success',
          asset: 'USDT',
          chain: 'BSC',
          block_number: blockNumber,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('创建钱包交易记录错误:', error);
      throw error;
    }
  }

  private async updateUserBalance(userId: number, amount: string) {
    try {
      const balance = await this.strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      }) as any[];

      if (balance.length > 0) {
        // 更新现有余额
        const currentBalance = balance[0];
        const newBalance = parseFloat(currentBalance.usdtBalance || 0) + parseFloat(amount);
        
        await this.strapi.entityService.update('api::wallet-balance.wallet-balance' as any, currentBalance.id, {
          data: {
            usdtBalance: newBalance.toString()
          }
        });
      } else {
        // 创建新钱包余额
        await this.strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            user: userId,
            usdtBalance: amount,
            aiTokenBalance: '0'
          }
        });
      }
    } catch (error) {
      console.error('更新用户余额错误:', error);
      throw error;
    }
  }

  private async createRechargeRecord(userId: number, amount: string, fromAddress: string, toAddress: string, txHash: string, blockNumber: number) {
    try {
      return await this.strapi.entityService.create('api::recharge-record.recharge-record' as any, {
        data: {
          user: userId,
          amount: amount,
          fromAddress: fromAddress.toLowerCase(),
          toAddress: toAddress.toLowerCase(),
          status: 'confirmed',
          txHash: txHash,
          blockNumber: blockNumber,
          confirmedAt: new Date(),
          asset: 'USDT',
          chain: 'BSC'
        }
      });
    } catch (error) {
      console.error('创建充值记录错误:', error);
      throw error;
    }
  }

  private async sendSocketNotification(userId: number, amount: string, txHash: string) {
    try {
      // 这里应该发送Socket.IO通知
      // 由于Strapi没有内置Socket.IO，这里只是记录日志
      console.log(`📡 Socket通知: deposit:${userId} - 充值成功 ${amount} USDT, 交易哈希: ${txHash}`);
      
      // 实际实现时需要使用Socket.IO
      // io.to(`deposit:${userId}`).emit('confirmed', { amount, txHash });
      
    } catch (error) {
      console.error('发送Socket通知错误:', error);
    }
  }
}

export default BSCDepositListener; 