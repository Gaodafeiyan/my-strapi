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
      try {
        // 启动AI代币提现监听器
        const aiTokenWithdrawListener = require('./api/ai-token-withdraw/services/ai-token-withdraw-listener');
        if (aiTokenWithdrawListener && aiTokenWithdrawListener.startListener) {
          aiTokenWithdrawListener.startListener();
          console.log('✅ AI代币提现监听器已启动');
        }
      } catch (error) {
        console.log('⚠️ AI代币提现监听器启动失败:', error.message);
      }

      try {
        // 启动USDT提现监听器
        const usdtWithdrawListener = require('./api/usdt-withdraw/services/usdt-withdraw-listener');
        if (usdtWithdrawListener && usdtWithdrawListener.startListener) {
          usdtWithdrawListener.startListener();
          console.log('✅ USDT提现监听器已启动');
        }
      } catch (error) {
        console.log('⚠️ USDT提现监听器启动失败:', error.message);
      }

      try {
        // 启动充值监控器
        const rechargeMonitor = require('./api/recharge-monitor/services/recharge-monitor');
        if (rechargeMonitor && rechargeMonitor.startMonitor) {
          rechargeMonitor.startMonitor();
          console.log('✅ 充值监控器已启动');
        }
      } catch (error) {
        console.log('⚠️ 充值监控器启动失败:', error.message);
      }

      console.log('🚀 监听服务启动完成');
    }, 5000); // 延迟5秒启动，确保数据库连接已建立
  },
};
