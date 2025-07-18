/**
 * subscription-order service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::subscription-order.subscription-order' as any, ({ strapi }) => ({
  // 触发邀请返佣
  async triggerReferralReward(userId: number, amount: number, orderId: number) {
    try {
      // 获取用户信息
      const user = await strapi.entityService.findOne('plugin::users-permissions.user' as any, userId);
      if (!user || !user.invitedBy) {
        return;
      }

      // L1 直推返佣 (8%)
      const l1Referrer = user.invitedBy;
      const l1Amount = amount * 0.08;
      
      await this.createReferralReward(l1Referrer.id, userId, l1Amount, orderId);

      // L2 间推返佣 (2%)
      if (l1Referrer.invitedBy) {
        const l2Amount = amount * 0.02;
        await this.createReferralReward(l1Referrer.invitedBy.id, userId, l2Amount, orderId);
      }

    } catch (error) {
      console.error('❌ 邀请返佣失败:', error);
    }
  },

  // 创建返佣记录
  async createReferralReward(referrerId: number, fromUserId: number, amount: number, orderId: number) {
    try {
      // 创建返佣记录
      const referralReward = await strapi.entityService.create('api::referral-reward.referral-reward' as any, {
        data: {
          referrer: referrerId,
          fromUser: fromUserId,
          fromOrder: orderId,
          amountUSDT: amount
        }
      });

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'referral',
          direction: 'in',
          amount: amount,
          walletStatus: 'success',
          user: referrerId,
          asset: 1 // USDT asset ID
        }
      });

      // 更新推荐人余额
      const referrerBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: referrerId }
      });

      if (referrerBalance && referrerBalance.length > 0) {
        await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, referrerBalance[0].id, {
          data: {
            amount: referrerBalance[0].amount + amount
          }
        });
      } else {
        // 创建推荐人钱包余额
        await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            amount: amount,
            user: referrerId
          }
        });
      }

      console.log(`💰 返佣成功: 推荐人 ${referrerId}, 金额 ${amount} USDT`);

    } catch (error) {
      console.error('❌ 创建返佣记录失败:', error);
    }
  }
})); 