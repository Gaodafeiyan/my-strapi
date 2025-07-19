/**
 * lottery-spin service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::lottery-spin.lottery-spin' as any, ({ strapi }) => ({
  // 执行抽奖
  async executeSpin(userId: number, spinCost: number) {
    try {
      // 获取所有启用的奖品
      const prizes = await strapi.entityService.findMany('api::lottery-prize.lottery-prize' as any, {
        filters: { enabled: true }
      }) as any[];

      if (!prizes || prizes.length === 0) {
        throw new Error('NO_PRIZES_AVAILABLE');
      }

      // 计算总权重
      const totalWeight = prizes.reduce((sum, prize) => sum + prize.probabilityWeight, 0);

      // 随机选择奖品
      const random = Math.random() * totalWeight;
      let currentWeight = 0;
      let selectedPrize = null;

      for (const prize of prizes) {
        currentWeight += prize.probabilityWeight;
        if (random <= currentWeight) {
          selectedPrize = prize;
          break;
        }
      }

      if (!selectedPrize) {
        selectedPrize = prizes[prizes.length - 1]; // 保底选择最后一个
      }

      // 检查库存
      if (selectedPrize.stockQty !== -1 && selectedPrize.stockQty <= 0) {
        throw new Error('PRIZE_OUT_OF_STOCK');
      }

      // 扣除抽奖费用
      if (spinCost > 0) {
        const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
          filters: { user: userId }
        });

        if (walletBalance && walletBalance.length > 0) {
          await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
            data: {
              amount: walletBalance[0].amount - spinCost
            }
          });
        }

        // 创建钱包交易记录
        await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
          data: {
            txType: 'lottery_spin',
            direction: 'out',
            amount: spinCost,
            walletStatus: 'success',
            user: userId,
            asset: 1 // USDT asset ID
          }
        });
      }

      // 处理奖品发放
      await this.distributePrize(userId, selectedPrize);

      // 减少库存
      if (selectedPrize.stockQty !== -1) {
        await strapi.entityService.update('api::lottery-prize.lottery-prize' as any, selectedPrize.id, {
          data: {
            stockQty: selectedPrize.stockQty - 1
          }
        });
      }

      // 创建抽奖记录
      const spinRecord = await strapi.entityService.create('api::lottery-spin.lottery-spin' as any, {
        data: {
          user: userId,
          prize: selectedPrize.id,
          spinCostUSDT: spinCost,
          result: {
            prizeName: selectedPrize.name,
            prizeType: selectedPrize.prizeType,
            amount: selectedPrize.amount
          }
        }
      });

      console.log(`🎰 抽奖成功: 用户 ${userId}, 奖品 ${selectedPrize.name}`);

      return {
        prize: selectedPrize,
        spinRecord: spinRecord
      };

    } catch (error) {
      console.error('❌ 抽奖失败:', error);
      throw error;
    }
  },

  // 发放奖品
  async distributePrize(userId: number, prize: any) {
    try {
      switch (prize.prizeType) {
        case 'usdt':
          // 发放USDT
          const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
            filters: { user: userId }
          });

          if (walletBalance && walletBalance.length > 0) {
            await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
              data: {
                amount: walletBalance[0].amount + prize.amount
              }
            });
          } else {
            await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
              data: {
                amount: prize.amount,
                user: userId
              }
            });
          }

          // 创建钱包交易记录
          await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
            data: {
              txType: 'lottery_prize',
              direction: 'in',
              amount: prize.amount,
              walletStatus: 'success',
              user: userId,
              asset: 1 // USDT asset ID
            }
          });
          break;

        case 'ai_token':
          // 发放AI代币（这里需要根据实际AI代币系统实现）
          console.log(`🤖 发放AI代币: ${prize.amount}`);
          break;

        case 'physical':
          // 实物奖品（需要后续处理）
          console.log(`📦 实物奖品: ${prize.name}`);
          break;
      }

    } catch (error) {
      console.error('❌ 发放奖品失败:', error);
      throw error;
    }
  }
})); 