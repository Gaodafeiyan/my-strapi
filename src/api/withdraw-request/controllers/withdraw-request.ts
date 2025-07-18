/**
 * withdraw-request controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::withdraw-request.withdraw-request' as any, ({ strapi }) => ({
  // 重写创建方法，添加业务逻辑
  async create(ctx) {
    try {
      // 检查认证
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      const { toAddress, amountUSDT } = ctx.request.body.data;
      const userId = ctx.state.user.id;

      // 验证地址格式
      if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
        return ctx.badRequest('INVALID_ADDRESS');
      }

      // 验证金额
      const amount = parseFloat(amountUSDT);
      if (amount <= 0 || amount.toString().split('.')[1]?.length > 2) {
        return ctx.badRequest('INVALID_AMOUNT');
      }

      // 检查余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: userId }
      });

      if (!walletBalance || walletBalance.length === 0) {
        return ctx.badRequest('WALLET_NOT_FOUND');
      }

      const balance = walletBalance[0].amount;
      const fee = 0.01; // 固定手续费
      const totalRequired = amount + fee;

      if (balance < totalRequired) {
        return ctx.badRequest('INSUFFICIENT_BALANCE');
      }

      // 检查当日提现次数限制
      const dailyLimit = parseInt(process.env.DAILY_WITHDRAW_LIMIT || '5');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayWithdrawals = await strapi.entityService.findMany('api::withdraw-request.withdraw-request' as any, {
        filters: {
          user: userId,
          createdAt: {
            $gte: today
          }
        }
      });

      if (todayWithdrawals.length >= dailyLimit) {
        return ctx.tooManyRequests('DAILY_WITHDRAW_LIMIT_EXCEEDED');
      }

      // 创建提现请求
      const withdrawRequest = await strapi.entityService.create('api::withdraw-request.withdraw-request' as any, {
        data: {
          toAddress,
          amountUSDT: amount,
          status: 'pending',
          user: userId
        }
      });

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'withdraw',
          direction: 'out',
          amount: amount,
          walletStatus: 'pending',
          user: userId,
          asset: 1 // USDT asset ID
        }
      });

      // 冻结余额
      await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
        data: {
          amount: balance - totalRequired
        }
      });

      ctx.body = {
        withdrawRequestId: withdrawRequest.id,
        walletTxId: walletTx.id,
        message: 'Withdrawal request created successfully'
      };

    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // 自定义提现方法
  async customWithdraw(ctx) {
    try {
      // 检查认证
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      const { toAddress, amountUSDT } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 验证地址格式
      if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
        return ctx.badRequest('INVALID_ADDRESS');
      }

      // 验证金额
      const amount = parseFloat(amountUSDT);
      if (amount <= 0 || amount.toString().split('.')[1]?.length > 2) {
        return ctx.badRequest('INVALID_AMOUNT');
      }

      // 检查余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: userId }
      });

      if (!walletBalance || walletBalance.length === 0) {
        return ctx.badRequest('WALLET_NOT_FOUND');
      }

      const balance = walletBalance[0].amount;
      const fee = 0.01; // 固定手续费
      const totalRequired = amount + fee;

      if (balance < totalRequired) {
        return ctx.badRequest('INSUFFICIENT_BALANCE');
      }

      // 检查当日提现次数限制
      const dailyLimit = parseInt(process.env.DAILY_WITHDRAW_LIMIT || '5');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayWithdrawals = await strapi.entityService.findMany('api::withdraw-request.withdraw-request' as any, {
        filters: {
          user: userId,
          createdAt: {
            $gte: today
          }
        }
      });

      if (todayWithdrawals.length >= dailyLimit) {
        return ctx.tooManyRequests('DAILY_WITHDRAW_LIMIT_EXCEEDED');
      }

      // 创建提现请求
      const withdrawRequest = await strapi.entityService.create('api::withdraw-request.withdraw-request' as any, {
        data: {
          toAddress,
          amountUSDT: amount,
          status: 'pending',
          user: userId
        }
      });

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'withdraw',
          direction: 'out',
          amount: amount,
          walletStatus: 'pending',
          user: userId,
          asset: 1 // USDT asset ID
        }
      });

      // 冻结余额
      await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
        data: {
          amount: balance - totalRequired
        }
      });

      ctx.body = {
        withdrawRequestId: withdrawRequest.id,
        walletTxId: walletTx.id,
        message: 'Withdrawal request created successfully'
      };

    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 