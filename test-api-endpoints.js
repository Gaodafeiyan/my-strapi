const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 创建测试用户
async function createTestUser() {
  try {
    console.log('👤 创建测试用户...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'testuser' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: 'password123'
    });
    
    if (response.data.jwt) {
      console.log('✅ 测试用户创建成功');
      return response.data.jwt;
    }
  } catch (error) {
    console.log('❌ 创建测试用户失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试用户认证
async function testAuth() {
  try {
    console.log('🔐 测试用户认证...');
    
    // 尝试使用已存在的用户登录
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser877',
      password: '123456'
    });
    
    if (loginResponse.data.jwt) {
      console.log('✅ 认证成功，获取到JWT token');
      return loginResponse.data.jwt;
    }
  } catch (error) {
    console.log('❌ 认证失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试钱包余额API
async function testWalletBalance(token) {
  try {
    console.log('\n💰 测试钱包余额API...');
    
    const response = await axios.get(`${BASE_URL}/api/wallet-balances`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 钱包余额API正常:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ 钱包余额API失败:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}

// 测试USDT充值API
async function testRechargeUSDT(token) {
  try {
    console.log('\n💸 测试USDT充值API...');
    
    const response = await axios.post(`${BASE_URL}/api/wallet-balances/recharge-usdt`, {
      amount: 100
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ USDT充值API正常:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ USDT充值API失败:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}

// 测试USDT提现API
async function testUSDTWithdraw(token) {
  try {
    console.log('\n💸 测试USDT提现API...');
    
    const response = await axios.post(`${BASE_URL}/api/usdt-withdraws`, {
      amount: 50,
      address: '0x1234567890123456789012345678901234567890'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ USDT提现API正常:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ USDT提现API失败:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}

// 测试AI代币提现API
async function testAITokenWithdraw(token) {
  try {
    console.log('\n🤖 测试AI代币提现API...');
    
    const response = await axios.post(`${BASE_URL}/api/ai-token-withdraws`, {
      amount: 10,
      address: '0x1234567890123456789012345678901234567890'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ AI代币提现API正常:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ AI代币提现API失败:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}

// 测试充值记录API
async function testRechargeRecords(token) {
  try {
    console.log('\n📊 测试充值记录API...');
    
    const response = await axios.get(`${BASE_URL}/api/recharge-records`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 充值记录API正常:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ 充值记录API失败:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}

// 测试充值地址API
async function testDepositAddresses(token) {
  try {
    console.log('\n🏦 测试充值地址API...');
    
    const response = await axios.get(`${BASE_URL}/api/deposit-addresses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 充值地址API正常:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ 充值地址API失败:', error.response?.status, error.response?.data || error.message);
    return null;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试API接口...\n');
  
  // 测试认证
  const token = await testAuth();
  if (!token) {
    console.log('❌ 无法获取认证token，停止测试');
    return;
  }
  
  // 测试各个API
  await testWalletBalance(token);
  await testRechargeUSDT(token);
  await testUSDTWithdraw(token);
  await testAITokenWithdraw(token);
  await testRechargeRecords(token);
  await testDepositAddresses(token);
  
  console.log('\n🎉 API测试完成！');
}

// 运行测试
runTests().catch(console.error); 