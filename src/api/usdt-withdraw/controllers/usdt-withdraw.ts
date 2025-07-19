/**
 * usdt-withdraw controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::usdt-withdraw.usdt-withdraw' as any, ({ strapi }) => ({
  // 创建USDT提现请求
  async create(ctx) {
    try {
      const { amountUSDT, toAddress, chain = 'BSC' } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 验证提现金额
      if (!amountUSDT || parseFloat(amountUSDT) <= 0) {
        return ctx.badRequest('提现金额必须大于0');
      }

      // 验证地址格式
      if (!toAddress || toAddress.length < 10) {
        return ctx.badRequest('无效的提现地址');
      }

      // 检查用户余额
      const userBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      });

      if (!userBalance || userBalance.length === 0) {
        return ctx.badRequest('用户钱包余额不存在');
      }

      const balance = userBalance[0];
      if (parseFloat(balance.usdtBalance) < parseFloat(amountUSDT)) {
        return ctx.badRequest('USDT余额不足');
      }

      // 检查每日提现限制
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayWithdrawals = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw' as any, {
        filters: {
          user: userId,
          status: { $in: ['pending', 'processing', 'success'] },
          requestedAt: { $gte: today }
        }
      });

      const dailyTotal = todayWithdrawals.reduce((sum, w) => sum + parseFloat(w.amountUSDT), 0);
      const dailyLimit = 5; // 每日提现限制

      if (dailyTotal + parseFloat(amountUSDT) > dailyLimit) {
        return ctx.badRequest(`每日提现限制为${dailyLimit} USDT，今日已提现${dailyTotal} USDT`);
      }

      // 创建提现请求
      const withdrawal = await strapi.entityService.create('api::usdt-withdraw.usdt-withdraw' as any, {
        data: {
          user: userId,
          amountUSDT: parseFloat(amountUSDT),
          toAddress,
          chain,
          status: 'pending',
          fee: 0.01,
          requestedAt: new Date()
        }
      });

      // 扣除用户余额
      await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, balance.id, {
        data: {
          usdtBalance: parseFloat(balance.usdtBalance) - parseFloat(amountUSDT)
        }
      });

      ctx.body = {
        success: true,
        message: 'USDT提现请求已创建',
        data: withdrawal
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取用户的USDT提现记录
  async getUserWithdrawals(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10, status } = ctx.query;

      const filters: any = {
        user: userId
      };

      if (status) {
        filters.status = status;
      }

      const withdrawals = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw' as any, {
        filters,
        sort: { requestedAt: 'desc' },
        populate: ['user'],
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });

      ctx.body = {
        success: true,
        data: withdrawals
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 管理员获取所有USDT提现记录
  async getAllWithdrawals(ctx) {
    try {
      const { page = 1, pageSize = 20, status, user } = ctx.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (user) filters.user = user;

      const withdrawals = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw' as any, {
        filters,
        sort: { requestedAt: 'desc' },
        populate: ['user'],
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });

      ctx.body = {
        success: true,
        data: withdrawals
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 手动处理USDT提现
  async processWithdrawal(ctx) {
    try {
      const { id } = ctx.params;
      const { status, txHash, errorMessage } = ctx.request.body;

      const withdrawal = await strapi.entityService.findOne('api::usdt-withdraw.usdt-withdraw' as any, id);

      if (!withdrawal) {
        return ctx.notFound('提现记录不存在');
      }

      const updateData: any = {
        status,
        processedAt: new Date()
      };

      if (txHash) updateData.txHash = txHash;
      if (errorMessage) updateData.errorMessage = errorMessage;

      const updatedWithdrawal = await strapi.entityService.update('api::usdt-withdraw.usdt-withdraw' as any, id, {
        data: updateData
      });

      ctx.body = {
        success: true,
        message: 'USDT提现状态已更新',
        data: updatedWithdrawal
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 