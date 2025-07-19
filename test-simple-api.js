const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

console.log('🚀 开始测试API接口...');
console.log(`📍 测试目标: ${BASE_URL}`);
console.log('');

// 测试接口列表
const apis = [
  { name: '认购计划', url: '/api/subscription-plans' },
  { name: '抽奖配置', url: '/api/lottery-configs' },
  { name: '抽奖奖品', url: '/api/lottery-prizes' },
  { name: '商城商品', url: '/api/store-products' },
  { name: '用户列表', url: '/api/users' },
  { name: '钱包余额', url: '/api/wallet-balances' },
  { name: '钱包交易', url: '/api/wallet-txes' },
  { name: '认购订单', url: '/api/subscription-orders' },
  { name: '推荐奖励', url: '/api/referral-rewards' },
  { name: '充值地址', url: '/api/deposit-addresses' },
  { name: '提现申请', url: '/api/withdraw-requests' },
  { name: '抽奖记录', url: '/api/lottery-spins' },
  { name: '商城订单', url: '/api/shop-orders' }
];

async function testAPI(api) {
  try {
    console.log(`🧪 测试: ${api.name}`);
    const response = await axios.get(`${BASE_URL}${api.url}`);
    console.log(`✅ ${api.name} - 通过 (${response.status})`);
    if (response.data?.data) {
      console.log(`   数据量: ${response.data.data.length}`);
    }
  } catch (error) {
    console.log(`❌ ${api.name} - 失败 (${error.response?.status || '网络错误'})`);
  }
  console.log('');
}

async function testRegisterAPI() {
  try {
    console.log('🧪 测试: 注册接口');
    const response = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123',
      inviteCode: 'user'
    });
    console.log(`✅ 注册接口 - 通过 (${response.status})`);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ 注册接口 - 路由存在 (400 - 参数验证)');
    } else {
      console.log(`❌ 注册接口 - 失败 (${error.response?.status || '网络错误'})`);
    }
  }
  console.log('');
}

async function runTests() {
  // 测试GET接口
  for (const api of apis) {
    await testAPI(api);
  }
  
  // 测试注册接口
  await testRegisterAPI();
  
  console.log('📊 测试完成！');
}

runTests().catch(error => {
  console.error('💥 测试执行失败:', error.message);
}); 