/**
 * lottery-spin controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::lottery-spin.lottery-spin' as any, ({ strapi }) => ({
  // 抽奖接口
  async spin(ctx) {
    try {
      // 检查认证
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      const userId = ctx.state.user.id;

      // 获取抽奖配置
      const config = await strapi.entityService.findMany('api::lottery-config.lottery-config' as any, {
        filters: { enabled: true },
        limit: 1
      });

      if (!config || config.length === 0) {
        return ctx.badRequest('LOTTERY_NOT_CONFIGURED');
      }

      const lotteryConfig = config[0];
      const spinCost = lotteryConfig.spinCostUSDT;

      // 检查用户抽奖次数配额
      const userOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order' as any, {
        filters: {
          user: userId,
          orderState: 'active'
        }
      }) as any[];

      let totalQuota = 0;
      for (const order of userOrders) {
        totalQuota += order.lotterySpinQuota || 0;
      }

      // 检查已使用的抽奖次数
      const usedSpins = await strapi.entityService.count('api::lottery-spin.lottery-spin' as any, {
        filters: { user: userId }
      });

      if (usedSpins >= totalQuota) {
        return ctx.badRequest('NO_SPIN_QUOTA');
      }

      // 如果需要付费抽奖，检查余额
      if (spinCost > 0) {
        const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
          filters: { user: userId }
        });

        if (!walletBalance || walletBalance.length === 0 || walletBalance[0].amount < spinCost) {
          return ctx.badRequest('INSUFFICIENT_BALANCE');
        }
      }

      // 执行抽奖
      const result = await strapi.service('api::lottery-spin.lottery-spin').executeSpin(userId, spinCost);

      ctx.body = {
        success: true,
        prize: result.prize,
        spinCost: spinCost,
        remainingQuota: totalQuota - usedSpins - 1
      };

    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 