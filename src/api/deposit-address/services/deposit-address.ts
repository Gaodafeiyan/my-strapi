/**
 * deposit-address service
 */

import { factories } from '@strapi/strapi';
import { ethers } from 'ethers';

export default factories.createCoreService('api::deposit-address.deposit-address', ({ strapi }) => ({

  async generate(userId: number) {
    // 1. 从环境变量读取「项目方总助记词」
    const MNEMONIC = process.env.HD_MNEMONIC!;
    if (!MNEMONIC) throw new Error('HD_MNEMONIC not set');

    // 2. 根据 userId 派生第 N 条路径
    const hdRoot   = ethers.HDNodeWallet.fromPhrase(MNEMONIC);
    const child    = hdRoot.derivePath(`m/44'/60'/0'/0/${userId}`);

    // 3. 把地址写入 deposit-address content‑type
    return await strapi.entityService.create('api::deposit-address.deposit-address', {
      data: {
        address : child.address.toLowerCase(),
        network : 'BSC',
        user    : userId,
      },
    });
  },

  /** 取当前登录用户的充值地址，没有就派生一个再存 */
  async getOrCreate(userId: number) {
    const R = strapi.db.query('api::deposit-address.deposit-address');
    let rec = await R.findOne({ where: { user: userId } });
    if (!rec) {
      rec = await this.generate(userId);
    }
    return rec;
  },

})); 