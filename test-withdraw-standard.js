/**
 * 测试标准提现API
 */

const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testStandardWithdraw() {
  try {
    console.log('🚀 测试标准提现API...\n');

    // 1. 登录获取JWT
    console.log('1️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '887',
      password: '123456'
    });
    const jwt = loginResponse.data.jwt;
    console.log('✅ 登录成功\n');

    // 2. 测试标准提现API
    console.log('2️⃣ 测试标准提现API...');
    try {
      const withdrawResponse = await axios.post(`${BASE_URL}/api/withdraw-requests`, {
        data: {
          toAddress: '0x1234567890123456789012345678901234567890',
          amountUSDT: '100.00'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ 提现成功:', JSON.stringify(withdrawResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 提现失败:', error.response?.data || error.message);
      console.log('状态码:', error.response?.status);
    }

    // 3. 检查提现请求记录
    console.log('\n3️⃣ 检查提现请求记录...');
    try {
      const withdrawRequestsResponse = await axios.get(`${BASE_URL}/api/withdraw-requests`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 提现请求查询成功:', JSON.stringify(withdrawRequestsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 提现请求查询失败:', error.response?.data || error.message);
    }

    // 4. 检查钱包余额
    console.log('\n4️⃣ 检查钱包余额...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances?filters[user][$eq]=1`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 钱包余额查询成功:', JSON.stringify(balanceResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 钱包余额查询失败:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testStandardWithdraw(); 