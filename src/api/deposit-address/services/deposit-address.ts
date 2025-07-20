/**
 * deposit-address service
 */

import { factories } from '@strapi/strapi';
import { ethers } from 'ethers';

export default ({ strapi }) => ({
  /** 取当前登录用户的充值地址，没有就派生一个再存 */
  async getOrCreate(userId: number) {
    const R = strapi.db.query('api::deposit-address.deposit-address');
    let rec = await R.findOne({ where: { user: userId } });
    if (!rec) {
      // 使用环境变量中的助记词
      const mnemonic = process.env.WALLET_MNEMONIC || process.env.HOT_WALLET_PRIVKEY;
      if (!mnemonic) {
        throw new Error('WALLET_MNEMONIC or HOT_WALLET_PRIVKEY not found in environment');
      }
      
      // 从助记词派生地址
      const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
      const child = hdNode.derivePath(`m/44'/60'/0'/0/${userId}`);
      rec = await R.create({
        data: { address: child.address, network: 'BSC', user: userId }
      });
    }
    return rec;
  },
}); 