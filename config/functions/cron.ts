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
      // 每30秒执行一次提现处理
      console.log('💸 执行提现处理...');
      try {
        await strapi.service('api::withdraw-request.withdraw-processor').processPendingWithdrawals();
      } catch (error) {
        console.error('❌ 提现处理失败:', error);
      }
    },
  },

  '0 */5 * * * *': {
    task: async ({ strapi }) => {
      // 每5分钟执行一次统计报告
      console.log('📊 生成统计报告...');
      try {
        const stats = await strapi.service('api::withdraw-request.withdraw-processor').getWithdrawalStats();
        if (stats) {
          console.log('📈 提现统计:', stats);
        }
      } catch (error) {
        console.error('❌ 统计报告失败:', error);
      }
    },
  },
}; 