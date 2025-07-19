/**
 * wallet-balance controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::wallet-balance.wallet-balance' as any, ({ strapi }) => ({
  // 获取用户钱包余额
  async getUserBalance(ctx) {
    try {
      const userId = ctx.state.user.id;

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
            usdtBalance: 0,
            aiTokenBalance: 0
          }
        });

        ctx.body = {
          success: true,
          data: newBalance
        };
      } else {
        ctx.body = {
          success: true,
          data: balance[0]
        };
      }
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 更新用户余额
  async updateUserBalance(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { usdtBalance, aiTokenBalance } = ctx.request.body;

      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      }) as any[];

      if (balance.length === 0) {
        return ctx.notFound('用户钱包余额不存在');
      }

      const updateData: any = {};
      if (usdtBalance !== undefined) updateData.usdtBalance = parseFloat(usdtBalance);
      if (aiTokenBalance !== undefined) updateData.aiTokenBalance = parseFloat(aiTokenBalance);

      const updatedBalance = await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, balance[0].id, {
        data: updateData
      });

      ctx.body = {
        success: true,
        message: '钱包余额已更新',
        data: updatedBalance
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 充值USDT
  async rechargeUSDT(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount } = ctx.request.body;

      if (!amount || parseFloat(amount) <= 0) {
        return ctx.badRequest('充值金额必须大于0');
      }

      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      }) as any[];

      if (balance.length === 0) {
        // 创建新钱包余额
        const newBalance = await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            user: userId,
            usdtBalance: parseFloat(amount),
            aiTokenBalance: 0
          }
        });

        ctx.body = {
          success: true,
          message: 'USDT充值成功',
          data: newBalance
        };
      } else {
        // 更新现有余额
        const currentBalance = balance[0];
        const updatedBalance = await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, currentBalance.id, {
          data: {
            usdtBalance: parseFloat(currentBalance.usdtBalance) + parseFloat(amount)
          }
        });

        ctx.body = {
          success: true,
          message: 'USDT充值成功',
          data: updatedBalance
        };
      }
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 提现USDT
  async withdrawUSDT(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount } = ctx.request.body;

      if (!amount || parseFloat(amount) <= 0) {
        return ctx.badRequest('提现金额必须大于0');
      }

      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      }) as any[];

      if (balance.length === 0) {
        return ctx.badRequest('用户钱包余额不存在');
      }

      const currentBalance = balance[0];
      if (parseFloat(currentBalance.usdtBalance) < parseFloat(amount)) {
        return ctx.badRequest('USDT余额不足');
      }

      const updatedBalance = await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, currentBalance.id, {
        data: {
          usdtBalance: parseFloat(currentBalance.usdtBalance) - parseFloat(amount)
        }
      });

      ctx.body = {
        success: true,
        message: 'USDT提现成功',
        data: updatedBalance
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取所有用户余额（管理员）
  async getAllBalances(ctx) {
    try {
      const { page = 1, pageSize = 20, user } = ctx.query;

      const filters: any = {};
      if (user) filters.user = user;

      const balances = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters,
        sort: { updatedAt: 'desc' },
        populate: ['user'],
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });

      ctx.body = {
        success: true,
        data: balances
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 