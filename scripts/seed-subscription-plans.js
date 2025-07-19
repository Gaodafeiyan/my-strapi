/**
 * 认购计划种子数据脚本
 * 按照新的档位配置创建认购计划
 */

module.exports = async ({ strapi }) => {
  try {
    console.log('🌱 开始创建认购计划种子数据...');

    const plans = [
      {
        name: 'PLAN500',
        priceUSDT: 500,
        cycleDays: 15,
        staticYieldPct: 6.00,
        maxPurchaseCnt: 2,
        aiTokenBonusPct: 3.00,
        unlockAfterCnt: 2,
        enabled: true,
        referralPct: 100.00 // 100%返佣
      },
      {
        name: 'PLAN1K',
        priceUSDT: 1000,
        cycleDays: 20,
        staticYieldPct: 7.00,
        maxPurchaseCnt: 3,
        aiTokenBonusPct: 4.00,
        unlockAfterCnt: 3,
        enabled: true,
        referralPct: 90.00 // 90%返佣
      },
      {
        name: 'PLAN2K',
        priceUSDT: 2000,
        cycleDays: 25,
        staticYieldPct: 8.00,
        maxPurchaseCnt: 4,
        aiTokenBonusPct: 5.00,
        unlockAfterCnt: 4,
        enabled: true,
        referralPct: 80.00 // 80%返佣
      },
      {
        name: 'PLAN5K',
        priceUSDT: 5000,
        cycleDays: 30,
        staticYieldPct: 10.00,
        maxPurchaseCnt: 5,
        aiTokenBonusPct: 6.00,
        unlockAfterCnt: 0, // 最高档，无需解锁条件
        enabled: true,
        referralPct: 70.00 // 70%返佣
      }
    ];

    for (const planData of plans) {
      // 检查是否已存在
      const existingPlan = await strapi.entityService.findMany('api::subscription-plan.subscription-plan', {
        filters: {
          name: planData.name
        }
      });

      if (existingPlan && existingPlan.length > 0) {
        console.log(`ℹ️ 计划已存在: ${planData.name}`);
        continue;
      }

      // 创建计划
      const plan = await strapi.entityService.create('api::subscription-plan.subscription-plan', {
        data: planData
      });

      console.log(`✅ 创建计划成功: ${plan.name} (ID: ${plan.id})`);
    }

    console.log('🎉 认购计划种子数据创建完成！');

  } catch (error) {
    console.error('❌ 创建认购计划失败:', error);
  }
}; 