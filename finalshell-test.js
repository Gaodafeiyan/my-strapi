const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

console.log('🚀 开始API接口测试...');
console.log(`📍 测试目标: ${BASE_URL}`);
console.log('');

// 测试接口列表
const apiTests = [
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

let passed = 0;
let failed = 0;
let errors = [];

async function testAPI(api) {
  try {
    console.log(`🧪 测试: ${api.name}`);
    const response = await axios.get(`${BASE_URL}${api.url}`);
    console.log(`✅ ${api.name} - 通过 (${response.status})`);
    if (response.data?.data) {
      console.log(`   数据量: ${response.data.data.length}`);
    }
    passed++;
  } catch (error) {
    console.log(`❌ ${api.name} - 失败 (${error.response?.status || '网络错误'})`);
    failed++;
    errors.push({ name: api.name, error: error.response?.status || '网络错误' });
  }
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
    passed++;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ 注册接口 - 路由存在 (400 - 参数验证)');
      passed++;
    } else {
      console.log(`❌ 注册接口 - 失败 (${error.response?.status || '网络错误'})`);
      failed++;
      errors.push({ name: '注册接口', error: error.response?.status || '网络错误' });
    }
  }
}

async function runTests() {
  // 测试GET接口
  for (const api of apiTests) {
    await testAPI(api);
    await new Promise(resolve => setTimeout(resolve, 100)); // 延迟100ms
  }
  
  // 测试注册接口
  await testRegisterAPI();
  
  // 结果汇总
  console.log('');
  console.log('📊 测试结果汇总:');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('');
    console.log('❌ 失败详情:');
    errors.forEach(({ name, error }) => {
      console.log(`   ${name}: ${error}`);
    });
  }
  
  console.log('');
  if (failed === 0) {
    console.log('🎉 所有API接口测试通过！');
  } else {
    console.log('⚠️  部分API接口存在问题，请检查修复');
  }
}

// 运行测试
runTests().catch(error => {
  console.error('💥 测试执行失败:', error.message);
}); 