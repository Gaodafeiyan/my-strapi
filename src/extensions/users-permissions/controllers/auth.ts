/**
 * extended auth controller for users-permissions
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async register(ctx) {
    try {
      // 1️⃣ 调用 users-permissions 自带 service 创建账户
      const result = await strapi
        .plugin('users-permissions')
        .service('user')
        .add(ctx.request.body);

      // 2️⃣ 创建钱包余额记录
      await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
        data: {
          usdtBalance: 0,
          aiTokenBalance: 0,
          user: result.id
        }
      });

      // 3️⃣ 返回 jwt、用户信息
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: result.id });

      ctx.body = { 
        jwt, 
        user: result
      };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 