/**
 * subscription-order controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::subscription-order.subscription-order' as any, ({ strapi }) => ({
  // 重写创建方法，添加认购业务逻辑
  async create(ctx) {
    try {
      // 检查认证
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      const { planId, quantity = 1 } = ctx.request.body.data;
      const userId = ctx.state.user.id;

      // 验证数量
      if (quantity < 1) {
        return ctx.badRequest('INVALID_QUANTITY');
      }

      // 获取认购计划
      const plan = await strapi.entityService.findOne('api::subscription-plan.subscription-plan' as any, planId);
      if (!plan) {
        return ctx.badRequest('PLAN_NOT_FOUND');
      }

      // 检查计划是否启用
      if (!plan.enabled) {
        return ctx.badRequest('PLAN_DISABLED');
      }

      // 检查数量限制
      if (quantity > plan.maxPurchaseCnt) {
        return ctx.badRequest('INVALID_QUANTITY');
      }

      // 检查用户现有同计划订单数量
      const existingOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order' as any, {
        filters: {
          user: userId,
          plan: planId,
          orderState: 'active'
        }
      });

      if (existingOrders.length >= plan.maxPurchaseCnt) {
        return ctx.badRequest('LIMIT_EXCEEDED');
      }

      // 计算总价
      const totalPrice = plan.priceUSDT * quantity;

      // 检查钱包余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: userId }
      });

      if (!walletBalance || walletBalance.length === 0) {
        return ctx.badRequest('WALLET_NOT_FOUND');
      }

      const balance = walletBalance[0].amount;
      if (balance < totalPrice) {
        return ctx.badRequest('INSUFFICIENT_BALANCE');
      }

      // 计算结束时间
      const startAt = new Date();
      const endAt = new Date(startAt.getTime() + plan.cycleDays * 24 * 60 * 60 * 1000);

      // 创建认购订单
      const subscriptionOrder = await strapi.entityService.create('api::subscription-order.subscription-order' as any, {
        data: {
          plan: planId,
          user: userId,
          quantity: quantity,
          principalUSDT: totalPrice,
          orderState: 'active',
          startAt: startAt,
          endAt: endAt,
          staticYieldUSDT: 0,
          aiTokenQty: plan.aiTokenBonusPct ? (totalPrice * plan.aiTokenBonusPct / 100) : 0
        }
      });

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'subscription',
          direction: 'out',
          amount: totalPrice,
          walletStatus: 'success',
          user: userId,
          asset: 1 // USDT asset ID
        }
      });

      // 扣除钱包余额
      await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
        data: {
          amount: balance - totalPrice
        }
      });

      // 触发邀请返佣
      await strapi.service('api::subscription-order.subscription-order').triggerReferralReward(userId, totalPrice, subscriptionOrder.id);

      ctx.body = {
        orderId: subscriptionOrder.id,
        walletTxId: walletTx.id,
        message: 'Subscription order created successfully'
      };

    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 