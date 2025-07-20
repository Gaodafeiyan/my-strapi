/**
 * deposit-address service
 */

import { ethers } from 'ethers';
import type { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  /** 取当前登录用户的充值地址，没有就派生一个再存 */
  async getOrCreate(userId: number) {
    const R = strapi.db.query('api::deposit-address.deposit-address');
    let rec = await R.findOne({ where: { user: userId } });
    if (!rec) {
      // 示范：用热钱包私钥 + userId 做"甩地址"
      const wallet = new ethers.Wallet(process.env.HOT_WALLET_PRIVKEY!);
      const hdNode = ethers.HDNodeWallet.fromMnemonic(wallet.mnemonic!);
      const child = hdNode.derivePath(`m/44'/60'/0'/0/${userId}`);
      rec = await R.create({
        data: { address: child.address, network: 'BSC', user: userId }
      });
    }
    return rec;
  },
}); 