const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 快速测试主要API接口
const apiTests = [
  { name: '认购计划', url: '/api/subscription-plans', method: 'GET' },
  { name: '抽奖配置', url: '/api/lottery-configs', method: 'GET' },
  { name: '抽奖奖品', url: '/api/lottery-prizes', method: 'GET' },
  { name: '商城商品', url: '/api/store-products', method: 'GET' },
  { name: '用户列表', url: '/api/users', method: 'GET' },
  { name: '钱包余额', url: '/api/wallet-balances', method: 'GET' },
  { name: '钱包交易', url: '/api/wallet-txes', method: 'GET' },
  { name: '认购订单', url: '/api/subscription-orders', method: 'GET' },
  { name: '推荐奖励', url: '/api/referral-rewards', method: 'GET' },
  { name: '充值地址', url: '/api/deposit-addresses', method: 'GET' },
  { name: '提现申请', url: '/api/withdraw-requests', method: 'GET' },
  { name: '抽奖记录', url: '/api/lottery-spins', method: 'GET' },
  { name: '商城订单', url: '/api/shop-orders', method: 'GET' },
  { name: '注册接口', url: '/api/wallet/auth/invite-register', method: 'POST' }
];

async function testAPI(test) {
  try {
    console.log(`🧪 测试: ${test.name}`);
    
    if (test.method === 'GET') {
      const response = await axios.get(`${BASE_URL}${test.url}`);
      console.log(`✅ ${test.name} - 通过 (${response.status})`);
      if (response.data?.data) {
        console.log(`   数据量: ${response.data.data.length}`);
      }
    } else if (test.method === 'POST') {
      // 对于POST接口，只测试路由是否存在
      try {
        const response = await axios.post(`${BASE_URL}${test.url}`, {
          username: 'test',
          email: 'test@example.com',
          password: 'test123',
          inviteCode: 'user'
        });
        console.log(`✅ ${test.name} - 通过 (${response.status})`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`✅ ${test.name} - 路由存在 (400 - 参数验证)`);
        } else {
          console.log(`❌ ${test.name} - 失败 (${error.response?.status || '网络错误'})`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ ${test.name} - 失败 (${error.response?.status || '网络错误'})`);
  }
  console.log('');
}

async function runQuickTest() {
  console.log('🚀 快速API接口测试...');
  console.log(`📍 测试目标: ${BASE_URL}`);
  console.log('');
  
  for (const test of apiTests) {
    await testAPI(test);
  }
  
  console.log('📊 快速测试完成');
}

runQuickTest().catch(error => {
  console.error('💥 测试执行失败:', error.message);
  process.exit(1);
}); 