/**
 * usdt-withdraw service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::usdt-withdraw.usdt-withdraw' as any, ({ strapi }) => ({
  async createWithdraw(ctx) {
    const { amountUSDT, toAddress } = ctx.request.body;
    const userId = ctx.state.user.id;

    // 验证地址格式
    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      throw new Error('无效的BSC地址');
    }

    // 验证金额
    if (!amountUSDT || Number(amountUSDT) <= 0) {
      throw new Error('无效的提现金额');
    }

    return await strapi.db.transaction(async ({ trx }) => {
      // 获取用户钱包余额
      const balance = await strapi
        .query('api::wallet-balance.wallet-balance')
        .findOne({ 
          where: { user: userId }, 
          select: ['usdtBalance']
        });

      if (!balance) {
        throw new Error('钱包余额不存在');
      }

      if (Number(balance.usdtBalance) < Number(amountUSDT)) {
        throw new Error('余额不足');
      }

      // 冻结余额
      await strapi.query('api::wallet-balance.wallet-balance').update({
        where: { user: userId },
        data: { 
          usdtBalance: String(Number(balance.usdtBalance) - Number(amountUSDT)) 
        }
      });

      // 创建提现请求
      const withdrawRequest = await strapi.query('api::usdt-withdraw.usdt-withdraw').create({
        data: {
          amount: amountUSDT,
          toAddress,
          status: 'pending',
          user: userId,
          chain: 'BSC',
        }
      });

      // 创建交易记录
      await strapi.query('api::recharge-record.recharge-record').create({
        data: {
          amount: amountUSDT,
          type: 'withdraw',
          status: 'pending',
          user: userId,
          asset: 'USDT',
          chain: 'BSC',
          txHash: null,
        }
      });

      return withdrawRequest;
    });
  },

  async getWithdrawHistory(userId) {
    return await strapi.query('api::usdt-withdraw.usdt-withdraw').findMany({
      where: { user: userId },
      orderBy: { createdAt: 'desc' },
      populate: ['user'],
    });
  },

  async updateWithdrawStatus(id, status, txHash = null) {
    return await strapi.query('api::usdt-withdraw.usdt-withdraw').update({
      where: { id },
      data: { 
        status,
        txHash,
        processedAt: new Date(),
      },
    });
  },
})); 