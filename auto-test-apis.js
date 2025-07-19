const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// 测试接口列表
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

async function testAPI(test) {
  try {
    log(`🧪 测试: ${test.name}`, 'info');
    
    if (test.method === 'GET') {
      const response = await axios.get(`${BASE_URL}${test.url}`);
      log(`✅ ${test.name} - 通过 (${response.status})`, 'success');
      if (response.data?.data) {
        log(`   数据量: ${response.data.data.length}`, 'info');
      }
      results.passed++;
    } else if (test.method === 'POST') {
      // 对于POST接口，测试路由是否存在
      try {
        const response = await axios.post(`${BASE_URL}${test.url}`, {
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpass123',
          inviteCode: 'user'
        });
        log(`✅ ${test.name} - 通过 (${response.status})`, 'success');
        results.passed++;
      } catch (error) {
        if (error.response?.status === 400) {
          log(`✅ ${test.name} - 路由存在 (400 - 参数验证)`, 'success');
          results.passed++;
        } else {
          log(`❌ ${test.name} - 失败 (${error.response?.status || '网络错误'})`, 'error');
          results.failed++;
          results.errors.push({ name: test.name, error: error.response?.status || '网络错误' });
        }
      }
    }
  } catch (error) {
    log(`❌ ${test.name} - 失败 (${error.response?.status || '网络错误'})`, 'error');
    results.failed++;
    results.errors.push({ name: test.name, error: error.response?.status || '网络错误' });
  }
}

async function runAutoTest() {
  log('🚀 开始自动API接口测试...', 'info');
  log(`📍 测试目标: ${BASE_URL}`, 'info');
  log('', 'info');
  
  // 测试所有接口
  for (const test of apiTests) {
    await testAPI(test);
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 测试结果汇总
  log('', 'info');
  log('📊 测试结果汇总:', 'info');
  log(`✅ 通过: ${results.passed}`, 'success');
  log(`❌ 失败: ${results.failed}`, 'error');
  log(`📈 成功率: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`, 'info');
  
  if (results.errors.length > 0) {
    log('', 'info');
    log('❌ 失败详情:', 'error');
    results.errors.forEach(({ name, error }) => {
      log(`   ${name}: ${error}`, 'error');
    });
  }
  
  log('', 'info');
  if (results.failed === 0) {
    log('🎉 所有API接口测试通过！', 'success');
  } else {
    log('⚠️  部分API接口存在问题，请检查修复', 'warning');
  }
  
  // 返回测试结果
  return {
    total: results.passed + results.failed,
    passed: results.passed,
    failed: results.failed,
    successRate: ((results.passed / (results.passed + results.failed)) * 100).toFixed(1)
  };
}

// 运行自动测试
runAutoTest().then(result => {
  log(`\n📋 最终结果: ${result.passed}/${result.total} 通过 (${result.successRate}%)`, 'info');
}).catch(error => {
  log(`💥 测试执行失败: ${error.message}`, 'error');
  process.exit(1);
}); 