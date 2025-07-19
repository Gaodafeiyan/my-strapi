/**
 * static-yield service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::subscription-order.subscription-order' as any, ({ strapi }) => ({
  // 处理静态收益
  async processStaticYield() {
    try {
      console.log('💰 开始处理静态收益...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 获取所有活跃的认购订单
      const activeOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order' as any, {
        filters: {
          orderState: 'active',
          endAt: {
            $gte: today
          }
        },
        populate: ['plan', 'user']
      });

      if (!activeOrders || activeOrders.length === 0) {
        console.log('ℹ️ 没有活跃的认购订单');
        return;
      }

      console.log(`📋 找到 ${activeOrders.length} 个活跃订单`);

      for (const order of activeOrders as any[]) {
        await this.processOrderYield(order);
      }

      console.log('✅ 静态收益处理完成');
    } catch (error) {
      console.error('❌ 静态收益处理失败:', error);
    }
  },

  // 处理单个订单的收益
  async processOrderYield(order: any) {
    try {
      const plan = order.plan;
      const user = order.user;

      // 计算每日收益：本金 × 静态收益率 ÷ 周期天数
      const dailyYield = order.principalUSDT * (plan.staticYieldPct / 100) / plan.cycleDays;

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'static',
          direction: 'in',
          amount: dailyYield,
          walletStatus: 'success',
          user: user.id,
          asset: 1 // USDT asset ID
        }
      });

      // 更新订单的累计收益
      await strapi.entityService.update('api::subscription-order.subscription-order' as any, order.id, {
        data: {
          staticYieldUSDT: order.staticYieldUSDT + dailyYield
        }
      });

      // 更新用户钱包余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: user.id }
      });

      if (walletBalance && walletBalance.length > 0) {
        await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
          data: {
            amount: walletBalance[0].amount + dailyYield
          }
        });
      } else {
        // 创建用户钱包余额
        await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            amount: dailyYield,
            user: user.id
          }
        });
      }

      console.log(`💰 静态收益: 用户 ${user.username}, 订单 ${order.id}, 收益 ${dailyYield} USDT`);

      // 检查是否到期
      const now = new Date();
      if (now >= new Date(order.endAt)) {
        await this.finishOrder(order);
      }

    } catch (error) {
      console.error(`❌ 处理订单收益失败 ID: ${order.id}:`, error);
    }
  },

  // 完成订单
  async finishOrder(order: any) {
    try {
      // 更新订单状态为完成
      await strapi.entityService.update('api::subscription-order.subscription-order' as any, order.id, {
        data: {
          orderState: 'finished'
        }
      });

      console.log(`✅ 订单完成: ID ${order.id}`);

      // 返还本金
      await this.returnPrincipal(order);

      // 触发邀请返佣（订单完成时）
      await this.triggerReferralReward(order);

      // 检查AI代币解锁条件
      await this.checkAiTokenUnlock(order);

    } catch (error) {
      console.error(`❌ 完成订单失败 ID: ${order.id}:`, error);
    }
  },

  // 返还本金
  async returnPrincipal(order: any) {
    try {
      const user = order.user;
      const principal = order.principalUSDT;

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'principal_return',
          direction: 'in',
          amount: principal,
          walletStatus: 'success',
          user: user.id,
          asset: 1 // USDT asset ID
        }
      });

      // 更新用户钱包余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: user.id }
      });

      if (walletBalance && walletBalance.length > 0) {
        await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
          data: {
            amount: walletBalance[0].amount + principal
          }
        });
      } else {
        // 创建用户钱包余额
        await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            amount: principal,
            user: user.id
          }
        });
      }

      console.log(`💰 返还本金: 用户 ${user.username}, 金额 ${principal} USDT`);

    } catch (error) {
      console.error('❌ 返还本金失败:', error);
    }
  },

  // 触发邀请返佣（订单完成时）
  async triggerReferralReward(order: any) {
    try {
      const user = order.user;
      const plan = order.plan;

      // 获取用户的推荐人
      const userWithReferrer = await strapi.entityService.findOne('plugin::users-permissions.user' as any, user.id, {
        populate: ['invitedBy']
      });

      if (!userWithReferrer || !userWithReferrer.invitedBy) {
        console.log(`ℹ️ 用户 ${user.username} 没有推荐人，跳过返佣`);
        return;
      }

      const referrer = userWithReferrer.invitedBy;
      
      // 计算返佣金额：静态收益 × 返佣百分比
      const referralAmount = order.staticYieldUSDT * (plan.referralPct / 100);

      if (referralAmount > 0) {
        // 创建返佣记录
        const referralReward = await strapi.entityService.create('api::referral-reward.referral-reward' as any, {
          data: {
            referrer: referrer.id,
            fromUser: user.id,
            fromOrder: order.id,
            amountUSDT: referralAmount
          }
        });

        // 创建钱包交易记录
        const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
          data: {
            txType: 'referral',
            direction: 'in',
            amount: referralAmount,
            walletStatus: 'success',
            user: referrer.id,
            asset: 1 // USDT asset ID
          }
        });

        // 更新推荐人余额
        const referrerBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
          filters: { user: referrer.id }
        });

        if (referrerBalance && referrerBalance.length > 0) {
          await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, referrerBalance[0].id, {
            data: {
              amount: referrerBalance[0].amount + referralAmount
            }
          });
        } else {
          // 创建推荐人钱包余额
          await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
            data: {
              amount: referralAmount,
              user: referrer.id
            }
          });
        }

        console.log(`💰 返佣成功: 推荐人 ${referrer.username}, 金额 ${referralAmount} USDT`);
      }

    } catch (error) {
      console.error('❌ 邀请返佣失败:', error);
    }
  },

  // 检查AI代币解锁
  async checkAiTokenUnlock(order: any) {
    try {
      const plan = order.plan;
      const user = order.user;

      // 检查用户完成的订单数量
      const finishedOrders = await strapi.entityService.findMany('api::subscription-order.subscription-order' as any, {
        filters: {
          user: user.id,
          plan: plan.id,
          orderState: 'finished'
        }
      });

      if (finishedOrders.length >= plan.unlockAfterCnt) {
        // 解锁AI代币
        if (order.aiTokenQty > 0) {
          // 创建AI代币交易记录
          const aiTokenTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
            data: {
              txType: 'aiToken',
              direction: 'in',
              amount: order.aiTokenQty,
              walletStatus: 'success',
              user: user.id,
              asset: 2 // AI Token asset ID
            }
          });

          console.log(`🎁 AI代币解锁: 用户 ${user.username}, 数量 ${order.aiTokenQty}`);
        }
      }

    } catch (error) {
      console.error(`❌ AI代币解锁检查失败:`, error);
    }
  }
})); 