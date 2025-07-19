const { Strapi } = require('@strapi/strapi');

async function initPlatformWallets() {
  try {
    console.log('🚀 初始化平台收款钱包...');
    
    const strapi = await Strapi().load();
    
    // 创建USDT收款钱包
    const usdtWallet = await strapi.entityService.create('api::platform-wallet.platform-wallet', {
      data: {
        name: 'USDT收款钱包',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chain: 'BSC',
        tokenType: 'USDT',
        isActive: true,
        isDefault: true,
        balance: '0',
        minAmount: '10',
        maxAmount: '10000',
        dailyLimit: '50000',
        totalReceived: '0',
        transactionCount: 0,
        description: 'BSC网络USDT收款钱包',
        notes: '默认USDT收款地址，可在后台修改'
      }
    });
    
    console.log('✅ USDT收款钱包已创建:', usdtWallet.id);
    
    // 创建AI Token收款钱包
    const aiTokenWallet = await strapi.entityService.create('api::platform-wallet.platform-wallet', {
      data: {
        name: 'AI Token收款钱包',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chain: 'BSC',
        tokenType: 'AI_TOKEN',
        isActive: true,
        isDefault: true,
        balance: '0',
        minAmount: '1',
        maxAmount: '1000',
        dailyLimit: '10000',
        totalReceived: '0',
        transactionCount: 0,
        description: 'BSC网络AI Token收款钱包',
        notes: 'AI Token收款地址'
      }
    });
    
    console.log('✅ AI Token收款钱包已创建:', aiTokenWallet.id);
    
    // 创建备用钱包
    const backupWallet = await strapi.entityService.create('api::platform-wallet.platform-wallet', {
      data: {
        name: '备用收款钱包',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chain: 'BSC',
        tokenType: 'USDT',
        isActive: true,
        isDefault: false,
        balance: '0',
        minAmount: '5',
        maxAmount: '5000',
        dailyLimit: '20000',
        totalReceived: '0',
        transactionCount: 0,
        description: '备用USDT收款钱包',
        notes: '备用收款地址，主钱包不可用时启用'
      }
    });
    
    console.log('✅ 备用收款钱包已创建:', backupWallet.id);
    console.log('📊 平台钱包初始化完成！');
    
    await strapi.destroy();
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  initPlatformWallets();
}

module.exports = { initPlatformWallets }; 