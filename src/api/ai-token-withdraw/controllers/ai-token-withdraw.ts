/**
 * ai-token-withdraw controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::ai-token-withdraw.ai-token-withdraw' as any, ({ strapi }) => ({
  // 重写创建方法，添加业务逻辑
  async create(ctx) {
    try {
      // 检查认证
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      const { toAddress, amountAI } = ctx.request.body.data;
      const userId = ctx.state.user.id;

      // 验证Solana地址格式
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(toAddress)) {
        return ctx.badRequest('INVALID_SOLANA_ADDRESS');
      }

      // 验证金额
      const amount = parseFloat(amountAI);
      if (amount <= 0 || amount.toString().split('.')[1]?.length > 2) {
        return ctx.badRequest('INVALID_AMOUNT');
      }

      // 检查AI代币余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: userId }
      });

      if (!walletBalance || walletBalance.length === 0) {
        return ctx.badRequest('WALLET_NOT_FOUND');
      }

      const balance = walletBalance[0].aiTokenBalance || 0;
      const fee = 0.01; // 固定手续费
      const totalRequired = amount + fee;

      if (balance < totalRequired) {
        return ctx.badRequest('INSUFFICIENT_AI_TOKEN_BALANCE');
      }

      // 检查当日AI代币提现次数限制
      const dailyLimit = parseInt(process.env.DAILY_AI_TOKEN_WITHDRAW_LIMIT || '3');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayWithdrawals = await strapi.entityService.findMany('api::ai-token-withdraw.ai-token-withdraw' as any, {
        filters: {
          user: userId,
          createdAt: {
            $gte: today
          }
        }
      });

      if (todayWithdrawals.length >= dailyLimit) {
        return ctx.tooManyRequests('DAILY_AI_TOKEN_WITHDRAW_LIMIT_EXCEEDED');
      }

      // 创建AI代币提现请求
      const aiTokenWithdrawRequest = await strapi.entityService.create('api::ai-token-withdraw.ai-token-withdraw' as any, {
        data: {
          toAddress,
          amountAI: amount,
          chain: 'SOLANA',
          status: 'pending',
          user: userId
        }
      });

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'aiToken',
          direction: 'out',
          amount: amount,
          walletStatus: 'pending',
          user: userId,
          asset: 2 // AI Token asset ID (假设AI代币的asset ID为2)
        }
      });

      // 冻结AI代币余额
      await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
        data: {
          aiTokenBalance: balance - totalRequired
        }
      });

      ctx.body = {
        aiTokenWithdrawRequestId: aiTokenWithdrawRequest.id,
        walletTxId: walletTx.id,
        message: 'AI Token withdrawal request created successfully'
      };

    } catch (error) {
      ctx.throw(400, error.message);
    }
  },

  // 自定义AI代币提现方法
  async customAiTokenWithdraw(ctx) {
    try {
      // 检查认证
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      const { toAddress, amountAI } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 验证Solana地址格式
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(toAddress)) {
        return ctx.badRequest('INVALID_SOLANA_ADDRESS');
      }

      // 验证金额
      const amount = parseFloat(amountAI);
      if (amount <= 0 || amount.toString().split('.')[1]?.length > 2) {
        return ctx.badRequest('INVALID_AMOUNT');
      }

      // 检查AI代币余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: userId }
      });

      if (!walletBalance || walletBalance.length === 0) {
        return ctx.badRequest('WALLET_NOT_FOUND');
      }

      const balance = walletBalance[0].aiTokenBalance || 0;
      const fee = 0.01; // 固定手续费
      const totalRequired = amount + fee;

      if (balance < totalRequired) {
        return ctx.badRequest('INSUFFICIENT_AI_TOKEN_BALANCE');
      }

      // 检查当日AI代币提现次数限制
      const dailyLimit = parseInt(process.env.DAILY_AI_TOKEN_WITHDRAW_LIMIT || '3');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayWithdrawals = await strapi.entityService.findMany('api::ai-token-withdraw.ai-token-withdraw' as any, {
        filters: {
          user: userId,
          createdAt: {
            $gte: today
          }
        }
      });

      if (todayWithdrawals.length >= dailyLimit) {
        return ctx.tooManyRequests('DAILY_AI_TOKEN_WITHDRAW_LIMIT_EXCEEDED');
      }

      // 创建AI代币提现请求
      const aiTokenWithdrawRequest = await strapi.entityService.create('api::ai-token-withdraw.ai-token-withdraw' as any, {
        data: {
          toAddress,
          amountAI: amount,
          chain: 'SOLANA',
          status: 'pending',
          user: userId
        }
      });

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'aiToken',
          direction: 'out',
          amount: amount,
          walletStatus: 'pending',
          user: userId,
          asset: 2 // AI Token asset ID
        }
      });

      // 冻结AI代币余额
      await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
        data: {
          aiTokenBalance: balance - totalRequired
        }
      });

      ctx.body = {
        aiTokenWithdrawRequestId: aiTokenWithdrawRequest.id,
        walletTxId: walletTx.id,
        message: 'AI Token withdrawal request created successfully'
      };

    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 