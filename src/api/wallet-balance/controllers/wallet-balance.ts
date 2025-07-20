/**
 * wallet-balance controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::wallet-balance.wallet-balance' as any, ({ strapi }) => ({
  // 重写find方法，只返回当前用户的余额
  async find(ctx) {
    try {
      // 检查用户是否已认证
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未认证');
      }

      const userId = ctx.state.user.id;

      // 查找用户的钱包余额
      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        },
        populate: ['user']
      }) as any[];

      if (balance.length === 0) {
        // 创建默认钱包余额
        const newBalance = await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            user: userId,
            amount: '0'
          }
        });

        ctx.body = {
          success: true,
          data: [newBalance]
        };
      } else {
        ctx.body = {
          success: true,
          data: balance
        };
      }
    } catch (error) {
      console.error('find error:', error);
      ctx.throw(500, error.message);
    }
  },

  /** GET /wallet-balances/deposit-address */
  async getDepositAddress(ctx) {
    try {
      const userId = ctx.state.user.id;
      const addr = await strapi.service('api::deposit-address.deposit-address')
        .getOrCreate(userId);

      // 生成二维码 (base64) 给前端
      const QRCode = require('qrcode');
      const base64 = await QRCode.toDataURL(addr.address);
      
      ctx.body = { 
        success: true,
        address: addr.address, 
        network: 'BSC', 
        qrcode: base64 
      };
    } catch (error) {
      console.error('getDepositAddress error:', error);
      ctx.throw(500, error.message);
    }
  },

  // 测试认证
  async testAuth(ctx) {
    try {
      console.log('testAuth called');
      console.log('ctx.state.user:', ctx.state.user);
      console.log('ctx.state.user.id:', ctx.state.user?.id);
      
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未认证');
      }

      ctx.body = {
        success: true,
        message: '认证成功',
        user: {
          id: ctx.state.user.id,
          username: ctx.state.user.username
        }
      };
    } catch (error) {
      console.error('testAuth error:', error);
      ctx.throw(500, error.message);
    }
  },
})); 