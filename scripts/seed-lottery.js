/**
 * 抽奖系统种子数据脚本
 */

module.exports = async ({ strapi }) => {
  try {
    console.log('🎰 开始创建抽奖系统种子数据...');

    // 1. 创建抽奖配置
    const lotteryConfig = await strapi.entityService.create('api::lottery-config.lottery-config', {
      data: {
        name: '淘金转盘',
        spinCostUSDT: 0, // 免费抽奖
        enabled: true
      }
    });

    console.log(`✅ 创建抽奖配置成功: ${lotteryConfig.name}`);

    // 2. 创建奖品
    const prizes = [
      {
        name: '一等奖 - 1000 USDT',
        description: '恭喜获得1000 USDT大奖！',
        prizeType: 'usdt',
        amount: 1000,
        probabilityWeight: 1,
        stockQty: 10,
        enabled: true
      },
      {
        name: '二等奖 - 500 USDT',
        description: '恭喜获得500 USDT！',
        prizeType: 'usdt',
        amount: 500,
        probabilityWeight: 5,
        stockQty: 50,
        enabled: true
      },
      {
        name: '三等奖 - 100 USDT',
        description: '恭喜获得100 USDT！',
        prizeType: 'usdt',
        amount: 100,
        probabilityWeight: 20,
        stockQty: 200,
        enabled: true
      },
      {
        name: '四等奖 - 50 USDT',
        description: '恭喜获得50 USDT！',
        prizeType: 'usdt',
        amount: 50,
        probabilityWeight: 50,
        stockQty: 500,
        enabled: true
      },
      {
        name: '五等奖 - 10 USDT',
        description: '恭喜获得10 USDT！',
        prizeType: 'usdt',
        amount: 10,
        probabilityWeight: 100,
        stockQty: 1000,
        enabled: true
      },
      {
        name: 'AI代币奖励',
        description: '获得AI代币奖励！',
        prizeType: 'ai_token',
        amount: 100,
        probabilityWeight: 30,
        stockQty: -1, // 无限库存
        enabled: true
      },
      {
        name: '谢谢参与',
        description: '谢谢参与，下次再来！',
        prizeType: 'usdt',
        amount: 0,
        probabilityWeight: 200,
        stockQty: -1, // 无限库存
        enabled: true
      }
    ];

    for (const prizeData of prizes) {
      const prize = await strapi.entityService.create('api::lottery-prize.lottery-prize', {
        data: prizeData
      });

      console.log(`✅ 创建奖品成功: ${prize.name} (权重: ${prize.probabilityWeight})`);
    }

    console.log('🎉 抽奖系统种子数据创建完成！');

  } catch (error) {
    console.error('❌ 创建抽奖系统失败:', error);
  }
}; 