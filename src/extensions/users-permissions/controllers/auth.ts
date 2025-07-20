/**
 * extended auth controller for users-permissions
 */

import { factories } from '@strapi/strapi';
import { nanoid } from 'nanoid';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async register(ctx) {
    try {
      // 调用原始的注册逻辑
      const result = await strapi.plugin('users-permissions').service('user').add(ctx.request.body);
      
      // 生成唯一标识
      const diamondId = nanoid(9);
      const referralCode = nanoid(9);
      
      // 更新用户，添加diamondId和referralCode
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', result.id, {
        data: {
          diamondId,
          referralCode,
          confirmed: true
        }
      });
      
      // 创建钱包余额记录
      await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
        data: {
          usdtBalance: 0,
          aiTokenBalance: 0,
          user: result.id
        }
      });
      
      // 生成 JWT token
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: result.id
      });
      
      ctx.body = {
        jwt,
        user: updatedUser
      };
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 