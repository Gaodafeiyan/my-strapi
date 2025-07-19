const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 获取认证token
async function getAuthToken() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser877',
      password: '123456'
    });
    
    if (response.data.jwt) {
      console.log('✅ 获取认证token成功');
      return response.data.jwt;
    }
  } catch (error) {
    console.log('❌ 获取认证token失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试USDT充值路由
async function testRechargeRoute(token) {
  console.log('\n🔍 测试USDT充值路由...\n');
  
  const testUrls = [
    '/api/wallet-balances/recharge-usdt',
    '/wallet-balances/recharge-usdt',
    '/api/wallet-balance/recharge-usdt',
    '/wallet-balance/recharge-usdt'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`测试 URL: ${url}`);
      
      const response = await axios.post(`${BASE_URL}${url}`, {
        amount: 100
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${url} 成功 (${response.status})`);
      console.log(`   响应: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.log(`❌ ${url} 失败: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

// 测试其他可能的充值路由
async function testAlternativeRoutes(token) {
  console.log('\n🔍 测试其他可能的充值路由...\n');
  
  const routes = [
    { method: 'POST', url: '/api/wallet-balances', data: { amount: 100, type: 'recharge' } },
    { method: 'POST', url: '/api/wallet-balance', data: { amount: 100, type: 'recharge' } },
    { method: 'PUT', url: '/api/wallet-balances/1', data: { usdtBalance: 100 } },
    { method: 'PUT', url: '/api/wallet-balance/1', data: { usdtBalance: 100 } }
  ];
  
  for (const route of routes) {
    try {
      console.log(`测试 ${route.method} ${route.url}`);
      
      const response = await axios[route.method.toLowerCase()](`${BASE_URL}${route.url}`, route.data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${route.method} ${route.url} 成功 (${response.status})`);
    } catch (error) {
      console.log(`❌ ${route.method} ${route.url} 失败: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试USDT充值路由...\n');
  
  const token = await getAuthToken();
  
  if (token) {
    await testRechargeRoute(token);
    await testAlternativeRoutes(token);
  } else {
    console.log('❌ 无法获取认证token');
  }
  
  console.log('\n💡 如果所有路由都失败，可能需要:');
  console.log('1. 检查Strapi服务器是否重启');
  console.log('2. 检查路由文件是否正确加载');
  console.log('3. 检查控制器方法是否存在');
}

main().catch(console.error); 