const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
let authToken = '';

async function testAuth() {
  try {
    // 1. 注册用户
    console.log('1. 注册用户...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'test123456',
      referralCode: 'user'
    });
    
    if (registerResponse.data.jwt) {
      console.log('注册成功:', registerResponse.data);
      authToken = registerResponse.data.jwt;
    } else {
      console.log('注册失败:', registerResponse.data);
      return;
    }

    // 2. 登录获取token
    console.log('\n2. 登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser2',
      password: 'test123456'
    });
    
    if (loginResponse.data.jwt) {
      console.log('登录成功:', loginResponse.data);
      authToken = loginResponse.data.jwt;
    } else {
      console.log('登录失败:', loginResponse.data);
      return;
    }

    // 3. 测试API
    console.log('\n3. 测试API...');
    
    // 测试余额查询
    const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('余额查询成功:', balanceResponse.data);

    // 测试充值地址
    const addressResponse = await axios.get(`${BASE_URL}/api/wallet-balances/deposit-address`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('充值地址查询成功:', addressResponse.data);

  } catch (error) {
    console.log('测试失败:', error.response?.data || error.message);
  }
}

testAuth(); 