const { Strapi } = require('@strapi/strapi');

async function initBlockchainConfig() {
  try {
    console.log('🚀 初始化区块链配置...');
    
    const strapi = await Strapi().load();
    
    // 创建BSC配置
    const bscConfig = await strapi.entityService.create('api::blockchain-config.blockchain-config', {
      data: {
        chain: 'BSC',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        contractAddress: '0x55d398326f99059fF775485246999027B3197955', // USDT合约
        projectWalletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        lastProcessedBlock: 0,
        isActive: true,
        scanInterval: 15,
        description: 'BSC网络USDT充值监听配置'
      }
    });
    
    console.log('✅ BSC配置已创建:', bscConfig.id);
    
    // 创建系统监控记录
    const depositListener = await strapi.entityService.create('api::system-monitor.system-monitor', {
      data: {
        serviceName: 'deposit_listener',
        status: 'stopped',
        processedCount: 0,
        errorCount: 0,
        isActive: true,
        description: 'BSC充值监听服务'
      }
    });
    
    const withdrawBroadcaster = await strapi.entityService.create('api::system-monitor.system-monitor', {
      data: {
        serviceName: 'withdraw_broadcaster',
        status: 'stopped',
        processedCount: 0,
        errorCount: 0,
        isActive: true,
        description: 'BSC提现广播服务'
      }
    });
    
    console.log('✅ 系统监控记录已创建');
    console.log('📊 初始化完成！');
    
    await strapi.destroy();
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  initBlockchainConfig();
}

module.exports = { initBlockchainConfig }; 