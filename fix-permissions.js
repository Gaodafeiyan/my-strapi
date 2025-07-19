const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试不同的认证方式
async function testDifferentAuth() {
  console.log('🔍 测试不同的认证方式...\n');
  
  // 1. 测试管理员登录
  try {
    console.log('1️⃣ 尝试管理员登录...');
    const adminResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'admin',
      password: 'admin123'
    });
    
    if (adminResponse.data.jwt) {
      console.log('✅ 管理员登录成功');
      return adminResponse.data.jwt;
    }
  } catch (error) {
    console.log('❌ 管理员登录失败');
  }
  
  // 2. 测试普通用户登录
  try {
    console.log('2️⃣ 尝试普通用户登录...');
    const userResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser877',
      password: '123456'
    });
    
    if (userResponse.data.jwt) {
      console.log('✅ 普通用户登录成功');
      return userResponse.data.jwt;
    }
  } catch (error) {
    console.log('❌ 普通用户登录失败');
  }
  
  // 3. 创建新用户并测试
  try {
    console.log('3️⃣ 创建新用户并测试...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'testuser' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: '123456'
    });
    
    if (registerResponse.data.jwt) {
      console.log('✅ 新用户创建成功');
      return registerResponse.data.jwt;
    }
  } catch (error) {
    console.log('❌ 创建新用户失败');
  }
  
  return null;
}

// 测试API权限
async function testAPIPermissions(token) {
  console.log('\n🔐 测试API权限...\n');
  
  const apis = [
    { name: '钱包余额', url: '/api/wallet-balances', method: 'GET' },
    { name: 'USDT充值', url: '/api/wallet-balances/recharge-usdt', method: 'POST' },
    { name: 'USDT提现', url: '/api/usdt-withdraws', method: 'POST' },
    { name: 'AI代币提现', url: '/api/ai-token-withdraws', method: 'POST' },
    { name: '充值记录', url: '/api/recharge-records', method: 'GET' },
    { name: '充值地址', url: '/api/deposit-addresses', method: 'GET' }
  ];
  
  for (const api of apis) {
    try {
      console.log(`测试 ${api.name}...`);
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      let response;
      if (api.method === 'GET') {
        response = await axios.get(`${BASE_URL}${api.url}`, config);
      } else if (api.method === 'POST') {
        const data = api.name === 'USDT充值' ? { amount: 100 } : 
                    api.name === 'USDT提现' ? { amount: 50, address: '0x123...' } :
                    api.name === 'AI代币提现' ? { amount: 10, address: '0x123...' } : {};
        
        response = await axios.post(`${BASE_URL}${api.url}`, data, config);
      }
      
      console.log(`✅ ${api.name} 正常 (${response.status})`);
    } catch (error) {
      console.log(`❌ ${api.name} 失败: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

// 主函数
async function main() {
  const token = await testDifferentAuth();
  
  if (token) {
    await testAPIPermissions(token);
  } else {
    console.log('❌ 无法获取有效的认证token');
  }
}

main().catch(console.error); 