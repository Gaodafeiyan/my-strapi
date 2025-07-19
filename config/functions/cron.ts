/**
 * Cron jobs configuration
 */

export default {
  /**
   * Cron jobs
   */
  '0 */1 * * * *': {
    task: async ({ strapi }) => {
      // 每小时执行一次补偿扫描
      console.log('🕐 执行每小时补偿扫描...');
      try {
        await strapi.service('api::wallet-tx.blockchain-listener').compensateScan();
      } catch (error) {
        console.error('❌ 补偿扫描失败:', error);
      }
    },
  },

  '*/15 * * * * *': {
    task: async ({ strapi }) => {
      // 每15秒执行一次区块链监听
      console.log('🔍 执行区块链监听...');
      try {
        await strapi.service('api::wallet-tx.blockchain-listener').listenForDeposits();
      } catch (error) {
        console.error('❌ 区块链监听失败:', error);
      }
    },
  },

  '*/30 * * * * *': {
    task: async ({ strapi }) => {
      // 每30秒执行一次USDT提现处理
      console.log('💸 执行USDT提现处理...');
      try {
        await strapi.service('api::usdt-withdraw.usdt-withdraw-listener').processPendingWithdrawals();
      } catch (error) {
        console.error('❌ USDT提现处理失败:', error);
      }
    },
  },

  '*/45 * * * * *': {
    task: async ({ strapi }) => {
      // 每45秒执行一次AI代币提现处理
      console.log('🤖 执行AI代币提现处理...');
      try {
        await strapi.service('api::ai-token-withdraw.ai-token-withdraw-listener').processPendingWithdrawals();
      } catch (error) {
        console.error('❌ AI代币提现处理失败:', error);
      }
    },
  },

  '0 */5 * * * *': {
    task: async ({ strapi }) => {
      // 每5分钟执行一次统计报告
      console.log('📊 生成提现统计报告...');
      try {
        const usdtStats = await strapi.service('api::usdt-withdraw.usdt-withdraw-listener').getWithdrawalStats();
        const aiTokenStats = await strapi.service('api::ai-token-withdraw.ai-token-withdraw-listener').getWithdrawalStats();
        if (usdtStats || aiTokenStats) {
          console.log('📈 USDT提现统计:', usdtStats);
          console.log('📈 AI代币提现统计:', aiTokenStats);
        }
      } catch (error) {
        console.error('❌ 统计报告失败:', error);
      }
    },
  },

  '5 0 * * *': {
    task: async ({ strapi }) => {
      // 每天 00:05 北京时间 执行静态收益处理
      console.log('💰 执行每日静态收益处理...');
      try {
        await strapi.service('api::subscription-order.static-yield').processStaticYield();
      } catch (error) {
        console.error('❌ 静态收益处理失败:', error);
      }
    },
  },
}; 