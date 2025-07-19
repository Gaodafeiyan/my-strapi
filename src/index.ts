// import type { Core } from '@strapi/strapi';

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
  bootstrap(/*{ strapi }*/) {
    // 启动所有监听服务
    setTimeout(() => {
      // 启动AI代币提现监听器
      const aiTokenWithdrawListener = require('./api/ai-token-withdraw/services/ai-token-withdraw-listener');
      aiTokenWithdrawListener.startListener();

      // 启动USDT提现监听器
      const usdtWithdrawListener = require('./api/usdt-withdraw/services/usdt-withdraw-listener');
      usdtWithdrawListener.startListener();

      // 启动充值监控器
      const rechargeMonitor = require('./api/recharge-monitor/services/recharge-monitor');
      rechargeMonitor.startMonitor();

      console.log('🚀 所有监听服务已启动');
    }, 5000); // 延迟5秒启动，确保数据库连接已建立
  },
};
