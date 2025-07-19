const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 所有API接口列表
const apiEndpoints = [
  // 基础数据接口
  { name: '认购计划', url: '/api/subscription-plans', method: 'GET' },
  { name: '抽奖配置', url: '/api/lottery-configs', method: 'GET' },
  { name: '抽奖奖品', url: '/api/lottery-prizes', method: 'GET' },
  { name: '商城商品', url: '/api/store-products', method: 'GET' },
  
  // 用户相关接口
  { name: '用户列表', url: '/api/users', method: 'GET' },
  { name: '注册接口', url: '/api/wallet/auth/invite-register', method: 'POST' },
  { name: '登录接口', url: '/api/auth/local', method: 'POST' },
  
  // 钱包相关接口
  { name: '钱包余额', url: '/api/wallet-balances', method: 'GET' },
  { name: '钱包交易', url: '/api/wallet-txes', method: 'GET' },
  { name: '充值地址', url: '/api/deposit-addresses', method: 'GET' },
  { name: '提现申请', url: '/api/withdraw-requests', method: 'GET' },
  
  // 业务接口
  { name: '认购订单', url: '/api/subscription-orders', method: 'GET' },
  { name: '推荐奖励', url: '/api/referral-rewards', method: 'GET' },
  { name: '抽奖记录', url: '/api/lottery-spins', method: 'GET' },
  { name: '商城订单', url: '/api/shop-orders', method: 'GET' },
  
  // 其他接口
  { name: '公告列表', url: '/api/announcements', method: 'GET' },
  { name: '横幅列表', url: '/api/banners', method: 'GET' },
  { name: '代币价格', url: '/api/token-prices', method: 'GET' },
  { name: '代币资产', url: '/api/token-assets', method: 'GET' }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`🧪 测试: ${endpoint.name}`);
    
    if (endpoint.method === 'GET') {
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        timeout: 5000
      });
      
      console.log(`✅ ${endpoint.name} - 通过 (${response.status})`);
      if (response.data?.data) {
        console.log(`   数据量: ${response.data.data.length}`);
      }
      return { status: 'success', code: response.status };
      
    } else if (endpoint.method === 'POST') {
      // 对于POST接口，测试路由是否存在
      try {
        const testData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpass123',
          inviteCode: 'user'
        };
        
        const response = await axios.post(`${BASE_URL}${endpoint.url}`, testData, {
          timeout: 5000
        });
        
        console.log(`✅ ${endpoint.name} - 通过 (${response.status})`);
        return { status: 'success', code: response.status };
        
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`✅ ${endpoint.name} - 路由存在 (400 - 参数验证)`);
          return { status: 'success', code: 400 };
        } else {
          console.log(`❌ ${endpoint.name} - 失败 (${error.response?.status || '网络错误'})`);
          return { status: 'error', code: error.response?.status || 'NETWORK_ERROR' };
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ ${endpoint.name} - 失败 (${error.response?.status || '网络错误'})`);
    return { status: 'error', code: error.response?.status || 'NETWORK_ERROR' };
  }
}

async function runAllTests() {
  console.log('🚀 开始检查所有API接口状态...');
  console.log(`📍 测试目标: ${BASE_URL}`);
  console.log('');
  
  const results = {
    success: 0,
    error: 0,
    details: []
  };
  
  for (const endpoint of apiEndpoints) {
    const result = await testEndpoint(endpoint);
    results.details.push({ name: endpoint.name, ...result });
    
    if (result.status === 'success') {
      results.success++;
    } else {
      results.error++;
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 输出结果汇总
  console.log('');
  console.log('📊 测试结果汇总:');
  console.log(`✅ 成功: ${results.success}`);
  console.log(`❌ 失败: ${results.error}`);
  console.log(`📈 成功率: ${((results.success / (results.success + results.error)) * 100).toFixed(1)}%`);
  
  if (results.error > 0) {
    console.log('');
    console.log('❌ 失败的接口:');
    results.details
      .filter(r => r.status === 'error')
      .forEach(r => {
        console.log(`   ${r.name}: ${r.code}`);
      });
  }
  
  console.log('');
  if (results.error === 0) {
    console.log('🎉 所有API接口测试通过！');
  } else {
    console.log('⚠️  部分API接口存在问题，请检查修复');
  }
}

runAllTests().catch(error => {
  console.error('💥 测试执行失败:', error.message);
  process.exit(1);
}); 