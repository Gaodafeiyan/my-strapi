/**
 * auth service
 */

import { factories } from '@strapi/strapi';
import { nanoid } from 'nanoid';

export default factories.createCoreService('api::wallet-balance.wallet-balance' as any, ({ strapi }) => ({
  async inviteRegister(payload: {
    username: string;
    email: string;
    password: string;
    inviteCode?: string;
  }) {
    const { username, email, password, inviteCode } = payload;

    // 验证邀请码
    let invitedBy = null;
    if (inviteCode) {
      const inviter = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { referralCode: inviteCode } as any
      });
      
      if (!inviter || inviter.length === 0) {
        throw new Error('INVALID_INVITE_CODE');
      }
      invitedBy = inviter[0].id;
    }

    // 生成唯一标识
    const diamondId = nanoid(9);
    const referralCode = nanoid(9);

    // 创建用户
    const user = await strapi.entityService.create('plugin::users-permissions.user', {
      data: {
        username,
        email,
        password,
        diamondId,
        referralCode,
        invitedBy,
        confirmed: true,
        blocked: false,
        role: 1 // Authenticated role
      }
    });

    // 创建钱包余额记录
    await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
      data: {
        amount: 0,
        user: user.id
      }
    });

    // 创建充值地址
    const depositAddress = await this.generateDepositAddress(Number(user.id));
    await strapi.entityService.create('api::deposit-address.deposit-address' as any, {
      data: {
        address: depositAddress,
        chain: 'BSC',
        user: user.id
      }
    });

    // 生成 JWT token
    const jwt = strapi.plugin('users-permissions').service('jwt').issue({
      id: user.id
    });

    return {
      jwt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        diamondId: (user as any).diamondId,
        referralCode: (user as any).referralCode
      }
    };
  },

  async generateDepositAddress(userId: number): Promise<string> {
    // 从环境变量获取助记词并派生新地址
    const mnemonic = process.env.DEPOSIT_ADDR_MNEMONIC;
    if (!mnemonic) {
      throw new Error('DEPOSIT_ADDR_MNEMONIC not configured');
    }

    // 这里应该使用 HDWallet 派生地址
    // 简化实现，实际应该使用 ethers.js 或 web3.js
    const address = `0x${userId.toString().padStart(40, '0')}`;
    return address;
  }
})); 