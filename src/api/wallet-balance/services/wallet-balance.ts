/**
 * wallet-balance service
 */

import { factories } from '@strapi/strapi';
import type { Schema } from '@strapi/strapi';
import { nanoid } from 'nanoid';

type WalletTx = any; // 临时使用any，避免类型错误

export default ({ strapi }) => ({
  /** 原子更新余额并写流水 */
  async add(userId: number, delta: string, tx: Partial<WalletTx>) {
    return strapi.db.transaction(async (trx) => {
      const B = strapi.db.query('api::wallet-balance.wallet-balance').transacting(trx);
      const WT = strapi.db.query('api::wallet-tx.wallet-tx').transacting(trx);

      // 1) 锁余额行
      let bal = await B.findOne({ where: { user: userId }, lock: { mode: 'pessimistic_write' } });
      if (!bal) bal = await B.create({ data: { amount: '0', user: userId } });

      // 2) 计算新余额
      const next = Number(bal.amount || 0) + Number(delta);
      if (next < 0) throw new Error('INSUFFICIENT_BALANCE');

      // 3) 持久化
      await B.update({ where: { id: bal.id }, data: { amount: next.toFixed(8) } });
      await WT.create({ data: { ...tx, amount: delta, user: userId, asset: 1 } });
      return next.toFixed(8);
    });
  },

  async inviteRegister(payload: {
    username: string;
    email: string;
    password: string;
    inviteCode: string;
  }) {
    const { username, email, password, inviteCode } = payload;

    // 验证邀请码
    let invitedBy = null;
    if (inviteCode) {
      const inviter = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { referralCode: inviteCode } as any
      });
      
      if (inviter && inviter.length > 0) {
        invitedBy = inviter[0].id;
      } else {
        console.log('邀请码无效，使用默认邀请人');
        // 如果邀请码无效，使用第一个用户作为邀请人
        const defaultInviter = await strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: { id: { $gt: 0 } } as any,
          sort: { id: 'asc' },
          limit: 1
        });
        
        if (defaultInviter && defaultInviter.length > 0) {
          invitedBy = defaultInviter[0].id;
        }
      }
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
        usdtBalance: 0,
        aiTokenBalance: 0,
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
        referralCode: (user as any).referralCode,
        invitedBy: (user as any).invitedBy
      }
    };
  },
}); 