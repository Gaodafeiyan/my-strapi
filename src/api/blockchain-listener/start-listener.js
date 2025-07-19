const BlockchainListener = require('./services/blockchain-listener');

// 启动区块链监听服务
async function startBlockchainListener() {
  try {
    console.log('🚀 正在启动区块链监听服务...');
    
    const listener = new BlockchainListener();
    await listener.startListening();
    
    console.log('✅ 区块链监听服务启动成功！');
    console.log('📡 正在监听BSC网络上的USDT转账...');
    console.log('🎯 项目方钱包地址: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
    
    // 保持进程运行
    process.on('SIGINT', () => {
      console.log('\n🛑 正在停止区块链监听服务...');
      listener.stopListening();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ 启动区块链监听服务失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  startBlockchainListener();
}

module.exports = { startBlockchainListener }; 