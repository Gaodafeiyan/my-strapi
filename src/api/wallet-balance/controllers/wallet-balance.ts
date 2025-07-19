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
            usdtBalance: 0,
            aiTokenBalance: 0
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

  // 重写findOne方法，确保用户只能访问自己的余额
  async findOne(ctx) {
    try {
      // 检查用户是否已认证
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未认证');
      }

      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      const balance = await strapi.entityService.findOne('api::wallet-balance.wallet-balance' as any, id, {
        populate: ['user']
      }) as any;

      if (!balance) {
        return ctx.notFound('钱包余额不存在');
      }

      // 检查是否是用户自己的余额
      if (balance.user?.id !== userId) {
        return ctx.forbidden('无权访问此钱包余额');
      }

      ctx.body = {
        success: true,
        data: balance
      };
    } catch (error) {
      console.error('findOne error:', error);
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