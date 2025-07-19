const axios = require('axios');

// 配置
const BASE_URL = 'http://118.107.4.158:1337';
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpass123'
};

// 测试结果存储
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// 辅助函数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // 青色
    success: '\x1b[32m', // 绿色
    error: '\x1b[31m',   // 红色
    warning: '\x1b[33m', // 黄色
    reset: '\x1b[0m'     // 重置
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

async function testAPI(name, testFn) {
  try {
    log(`🧪 测试: ${name}`, 'info');
    await testFn();
    log(`✅ ${name} - 通过`, 'success');
    testResults.passed++;
  } catch (error) {
    log(`❌ ${name} - 失败: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push({ name, error: error.message });
  }
}

// 测试函数
async function testHealthCheck() {
  const response = await axios.get(`${BASE_URL}/api/subscription-plans`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   服务器连接正常`);
}

async function testSubscriptionPlans() {
  const response = await axios.get(`${BASE_URL}/api/subscription-plans`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   认购计划数量: ${response.data.data?.length || 0}`);
}

async function testLotteryConfigs() {
  const response = await axios.get(`${BASE_URL}/api/lottery-configs`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   抽奖配置数量: ${response.data.data?.length || 0}`);
}

async function testLotteryPrizes() {
  const response = await axios.get(`${BASE_URL}/api/lottery-prizes`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   抽奖奖品数量: ${response.data.data?.length || 0}`);
}

async function testStoreProducts() {
  const response = await axios.get(`${BASE_URL}/api/store-products`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   商城商品数量: ${response.data.data?.length || 0}`);
}

async function testUsers() {
  const response = await axios.get(`${BASE_URL}/api/users`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   用户数量: ${response.data.data?.length || 0}`);
}

async function testWalletBalances() {
  const response = await axios.get(`${BASE_URL}/api/wallet-balances`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   钱包余额记录数: ${response.data.data?.length || 0}`);
}

async function testWalletTransactions() {
  const response = await axios.get(`${BASE_URL}/api/wallet-txes`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   钱包交易记录数: ${response.data.data?.length || 0}`);
}

async function testSubscriptionOrders() {
  const response = await axios.get(`${BASE_URL}/api/subscription-orders`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   认购订单数: ${response.data.data?.length || 0}`);
}

async function testReferralRewards() {
  const response = await axios.get(`${BASE_URL}/api/referral-rewards`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   推荐奖励记录数: ${response.data.data?.length || 0}`);
}

async function testDepositAddresses() {
  const response = await axios.get(`${BASE_URL}/api/deposit-addresses`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   充值地址数: ${response.data.data?.length || 0}`);
}

async function testWithdrawRequests() {
  const response = await axios.get(`${BASE_URL}/api/withdraw-requests`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   提现申请数: ${response.data.data?.length || 0}`);
}

async function testLotterySpins() {
  const response = await axios.get(`${BASE_URL}/api/lottery-spins`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   抽奖记录数: ${response.data.data?.length || 0}`);
}

async function testShopOrders() {
  const response = await axios.get(`${BASE_URL}/api/shop-orders`);
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   商城订单数: ${response.data.data?.length || 0}`);
}

async function testAuthRegister() {
  const response = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, {
    username: TEST_USER.username,
    email: TEST_USER.email,
    password: TEST_USER.password,
    inviteCode: 'user'
  });
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   注册成功: ${response.data.user?.username}`);
}

async function testAuthLogin() {
  const response = await axios.post(`${BASE_URL}/api/auth/local`, {
    identifier: TEST_USER.email,
    password: TEST_USER.password
  });
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status} - ${JSON.stringify(response.data)}`);
  }
  log(`   登录成功: ${response.data.user?.username}`);
  return response.data.jwt;
}

async function testProtectedEndpoints(token) {
  const headers = { Authorization: `Bearer ${token}` };
  
  // 测试需要认证的接口
  const response = await axios.get(`${BASE_URL}/api/users/me`, { headers });
  if (response.status !== 200) {
    throw new Error(`状态码: ${response.status}`);
  }
  log(`   获取用户信息成功: ${response.data.username}`);
}

// 主测试函数
async function runAllTests() {
  log('🚀 开始全面API测试...', 'info');
  log(`📍 测试目标: ${BASE_URL}`, 'info');
  log('', 'info');

  // 基础接口测试
  await testAPI('健康检查', testHealthCheck);
  await testAPI('认购计划接口', testSubscriptionPlans);
  await testAPI('抽奖配置接口', testLotteryConfigs);
  await testAPI('抽奖奖品接口', testLotteryPrizes);
  await testAPI('商城商品接口', testStoreProducts);
  
  // 数据查询接口测试
  await testAPI('用户列表接口', testUsers);
  await testAPI('钱包余额接口', testWalletBalances);
  await testAPI('钱包交易接口', testWalletTransactions);
  await testAPI('认购订单接口', testSubscriptionOrders);
  await testAPI('推荐奖励接口', testReferralRewards);
  await testAPI('充值地址接口', testDepositAddresses);
  await testAPI('提现申请接口', testWithdrawRequests);
  await testAPI('抽奖记录接口', testLotterySpins);
  await testAPI('商城订单接口', testShopOrders);
  
  // 认证接口测试
  await testAPI('用户注册接口', testAuthRegister);
  const token = await testAPI('用户登录接口', testAuthLogin);
  await testAPI('认证接口测试', () => testProtectedEndpoints(token));

  // 测试结果汇总
  log('', 'info');
  log('📊 测试结果汇总:', 'info');
  log(`✅ 通过: ${testResults.passed}`, 'success');
  log(`❌ 失败: ${testResults.failed}`, 'error');
  log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`, 'info');
  
  if (testResults.errors.length > 0) {
    log('', 'info');
    log('❌ 失败详情:', 'error');
    testResults.errors.forEach(({ name, error }) => {
      log(`   ${name}: ${error}`, 'error');
    });
  }
  
  log('', 'info');
  if (testResults.failed === 0) {
    log('🎉 所有API接口测试通过！', 'success');
  } else {
    log('⚠️  部分API接口存在问题，请检查修复', 'warning');
  }
}

// 运行测试
runAllTests().catch(error => {
  log(`💥 测试执行失败: ${error.message}`, 'error');
  process.exit(1);
}); 