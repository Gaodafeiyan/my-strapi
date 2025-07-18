const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testApiEndpoints() {
  console.log('🔍 测试API端点...');
  
  try {
    // 1. 用户注册
    console.log('\n1️⃣ 测试用户注册...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: 'testuser' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: '123456',
      inviteCode: 'user'
    });

    console.log('✅ 注册成功');
    const token = registerResponse.data.jwt;
    
    // 2. 测试各种API端点
    const endpoints = [
      { name: '钱包余额', url: '/api/wallet-balances', method: 'GET' },
      { name: '充值地址', url: '/api/deposit-addresses', method: 'GET' },
      { name: '提现请求', url: '/api/withdraw-requests', method: 'GET' },
      { name: '钱包交易', url: '/api/wallet-txes', method: 'GET' },
      { name: '自定义提现', url: '/api/wallet/withdraw', method: 'POST' },
      { name: '标准提现', url: '/api/withdraw-requests', method: 'POST' }
    ];

    for (const endpoint of endpoints) {
      console.log(`\n测试 ${endpoint.name}...`);
      try {
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        if (endpoint.method === 'POST') {
          config.headers['Content-Type'] = 'application/json';
        }

        let response;
        if (endpoint.method === 'GET') {
          response = await axios.get(`${BASE_URL}${endpoint.url}`, config);
        } else if (endpoint.method === 'POST') {
          const data = endpoint.name === '自定义提现' ? {
            toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            amountUSDT: 5.5
          } : {
            data: {
              toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
              amountUSDT: 5.5
            }
          };
          response = await axios.post(`${BASE_URL}${endpoint.url}`, data, config);
        }

        console.log(`✅ ${endpoint.name} 正常 (${response.status})`);
      } catch (error) {
        console.log(`❌ ${endpoint.name} 失败: ${error.response?.status} - ${error.response?.data}`);
      }
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

testApiEndpoints(); 