/**
 * Cron job configuration
 */

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},

  /**
   * An asynchronous destroy function that runs before
   * your application shuts down.
   *
   * This gives you an opportunity to gracefully close connections,
   * clean up resources, or perform some special logic.
   */
  destroy(/*{ strapi }*/) {},

  /**
   * Configure cron jobs
   */
  config: {
    // 区块链监听任务 - 每20秒执行一次
    'blockchain-listener': {
      schedule: '*/20 * * * * *', // 每20秒
      task: async ({ strapi }) => {
        try {
          console.log('Running blockchain listener...');
          const result = await strapi.service('api::wallet-tx.blockchain-listener').processDeposits();
          console.log('Blockchain listener result:', result);
        } catch (error) {
          console.error('Blockchain listener error:', error);
        }
      }
    },

    // 提现处理任务 - 每30秒执行一次
    'withdraw-processor': {
      schedule: '*/30 * * * * *', // 每30秒
      task: async ({ strapi }) => {
        try {
          console.log('Running withdraw processor...');
          const result = await strapi.service('api::wallet.withdraw').processPendingWithdrawals();
          console.log('Withdraw processor result:', result);
        } catch (error) {
          console.error('Withdraw processor error:', error);
        }
      }
    }
  }
}; 