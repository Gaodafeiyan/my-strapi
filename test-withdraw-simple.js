/**
 * 简单提现测试
 */

const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testWithdraw() {
  try {
    console.log('🚀 测试提现API...\n');

    // 1. 登录获取JWT
    console.log('1️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '887',
      password: '123456'
    });
    const jwt = loginResponse.data.jwt;
    console.log('✅ 登录成功\n');

    // 2. 测试提现API
    console.log('2️⃣ 测试提现API...');
    try {
      const withdrawResponse = await axios.post(`${BASE_URL}/api/wallet/withdraw`, {
        toAddress: '0x1234567890123456789012345678901234567890',
        amountUSDT: '100.00'
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

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testWithdraw(); 