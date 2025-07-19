const cron = require('node-cron');
const BSCDepositListener = require('./src/jobs/bscDepositListener.ts');
const BSCWithdrawBroadcaster = require('./src/jobs/bscWithdrawBroadcaster.ts');

// 启动区块链监听服务
async function startBlockchainServices() {
  try {
    console.log('🚀 启动区块链自动化服务...');
    
    // 启动Strapi
    const { Strapi } = require('@strapi/strapi');
    const strapi = await Strapi().load();
    
    console.log('✅ Strapi已启动');
    
    // 创建充值监听器
    const depositListener = new BSCDepositListener(strapi);
    
    // 创建提现广播器
    const withdrawBroadcaster = new BSCWithdrawBroadcaster(strapi);
    
    // 启动充值监听 (每15秒)
    cron.schedule('*/15 * * * * *', async () => {
      try {
        await depositListener.execute();
      } catch (error) {
        console.error('充值监听错误:', error);
      }
    });
    
    console.log('✅ 充值监听服务已启动 (每15秒)');
    
    // 启动提现广播 (每30秒)
    cron.schedule('*/30 * * * * *', async () => {
      try {
        await withdrawBroadcaster.execute();
      } catch (error) {
        console.error('提现广播错误:', error);
      }
    });
    
    console.log('✅ 提现广播服务已启动 (每30秒)');
    
    // 更新系统监控状态
    await updateSystemMonitorStatus(strapi, 'running');
    
    console.log('🎉 所有区块链服务已启动！');
    console.log('📡 正在监听BSC网络...');
    console.log('💰 自动处理充值和提现...');
    
    // 保持进程运行
    process.on('SIGINT', async () => {
      console.log('\n🛑 正在停止区块链服务...');
      await updateSystemMonitorStatus(strapi, 'stopped');
      await strapi.destroy();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ 启动区块链服务失败:', error);
    process.exit(1);
  }
}

// 更新系统监控状态
async function updateSystemMonitorStatus(strapi, status) {
  try {
    const monitors = await strapi.entityService.findMany('api::system-monitor.system-monitor', {
      filters: {
        serviceName: ['deposit_listener', 'withdraw_broadcaster']
      }
    });
    
    for (const monitor of monitors) {
      await strapi.entityService.update('api::system-monitor.system-monitor', monitor.id, {
        data: {
          status: status,
          lastRunAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('更新系统监控状态失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  startBlockchainServices();
}

module.exports = { startBlockchainServices }; 