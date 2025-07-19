const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

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

// 问题分类
const issues = {
  working: [],
  notFound: [],
  serverError: [],
  authError: [],
  networkError: [],
  otherError: []
};

function categorizeError(status, name, url) {
  if (status === 404) {
    issues.notFound.push({ name, url, status });
  } else if (status >= 500) {
    issues.serverError.push({ name, url, status });
  } else if (status === 401 || status === 403) {
    issues.authError.push({ name, url, status });
  } else {
    issues.otherError.push({ name, url, status });
  }
}

async function testAPI(test) {
  try {
    console.log(`🧪 测试: ${test.name}`);
    console.log(`   URL: ${BASE_URL}${test.url}`);
    
    if (test.method === 'GET') {
      const response = await axios.get(`${BASE_URL}${test.url}`);
      console.log(`✅ ${test.name} - 通过 (${response.status})`);
      if (response.data?.data) {
        console.log(`   数据量: ${response.data.data.length}`);
      }
      issues.working.push({ name: test.name, url: test.url, status: response.status });
    } else if (test.method === 'POST') {
      try {
        const response = await axios.post(`${BASE_URL}${test.url}`, {
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpass123',
          inviteCode: 'user'
        });
        console.log(`✅ ${test.name} - 通过 (${response.status})`);
        issues.working.push({ name: test.name, url: test.url, status: response.status });
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ 注册接口 - 路由存在 (400 - 参数验证)');
          issues.working.push({ name: test.name, url: test.url, status: 400 });
        } else {
          console.log(`❌ ${test.name} - 失败 (${error.response?.status || '网络错误'})`);
          categorizeError(error.response?.status, test.name, test.url);
        }
      }
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.log(`❌ ${test.name} - 网络连接错误`);
      issues.networkError.push({ name: test.name, url: test.url, error: error.code });
    } else {
      console.log(`❌ ${test.name} - 失败 (${error.response?.status || '未知错误'})`);
      categorizeError(error.response?.status, test.name, test.url);
    }
  }
  console.log('');
}

function printReport() {
  console.log('='.repeat(60));
  console.log('📊 API接口问题排查报告');
  console.log('='.repeat(60));
  
  console.log(`\n✅ 正常工作的接口 (${issues.working.length}个):`);
  issues.working.forEach(item => {
    console.log(`   - ${item.name} (${item.status})`);
  });
  
  if (issues.notFound.length > 0) {
    console.log(`\n❌ 404错误 - 接口不存在 (${issues.notFound.length}个):`);
    issues.notFound.forEach(item => {
      console.log(`   - ${item.name}: ${item.url}`);
    });
  }
  
  if (issues.serverError.length > 0) {
    console.log(`\n💥 服务器错误 (${issues.serverError.length}个):`);
    issues.serverError.forEach(item => {
      console.log(`   - ${item.name}: ${item.status} - ${item.url}`);
    });
  }
  
  if (issues.authError.length > 0) {
    console.log(`\n🔒 权限错误 (${issues.authError.length}个):`);
    issues.authError.forEach(item => {
      console.log(`   - ${item.name}: ${item.status} - ${item.url}`);
    });
  }
  
  if (issues.networkError.length > 0) {
    console.log(`\n🌐 网络错误 (${issues.networkError.length}个):`);
    issues.networkError.forEach(item => {
      console.log(`   - ${item.name}: ${item.error}`);
    });
  }
  
  if (issues.otherError.length > 0) {
    console.log(`\n⚠️ 其他错误 (${issues.otherError.length}个):`);
    issues.otherError.forEach(item => {
      console.log(`   - ${item.name}: ${item.status} - ${item.url}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔧 问题分析建议:');
  
  if (issues.notFound.length > 0) {
    console.log('\n📝 404错误解决方案:');
    console.log('1. 检查路由配置是否正确');
    console.log('2. 确认API路径拼写是否正确');
    console.log('3. 检查控制器和服务是否存在');
  }
  
  if (issues.serverError.length > 0) {
    console.log('\n📝 服务器错误解决方案:');
    console.log('1. 检查服务器日志');
    console.log('2. 确认数据库连接正常');
    console.log('3. 检查代码语法错误');
  }
  
  if (issues.authError.length > 0) {
    console.log('\n📝 权限错误解决方案:');
    console.log('1. 检查用户认证状态');
    console.log('2. 确认API权限配置');
    console.log('3. 检查JWT token是否有效');
  }
  
  if (issues.networkError.length > 0) {
    console.log('\n📝 网络错误解决方案:');
    console.log('1. 确认服务器正在运行');
    console.log('2. 检查防火墙设置');
    console.log('3. 确认IP地址和端口正确');
  }
  
  console.log('\n' + '='.repeat(60));
}

async function runDebug() {
  console.log('🚀 开始API接口问题排查...');
  console.log(`📍 测试目标: ${BASE_URL}`);
  console.log('');
  
  // 测试所有接口
  for (const test of apiTests) {
    await testAPI(test);
    await new Promise(resolve => setTimeout(resolve, 200)); // 延迟200ms
  }
  
  // 生成报告
  printReport();
}

// 运行排查
runDebug().catch(error => {
  console.error('💥 排查执行失败:', error.message);
}); 