const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testCustomWithdraw() {
  console.log('🚀 测试远程服务器自定义提现API...');
  
  try {
    // 1. 用户登录
    console.log('1️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser@example.com',
      password: '123456'
    });

    if (loginResponse.data.jwt) {
      console.log('✅ 登录成功');
      const token = loginResponse.data.jwt;
      
      // 2. 测试自定义提现API
      console.log('2️⃣ 测试自定义提现API...');
      const withdrawResponse = await axios.post(`${BASE_URL}/api/wallet/withdraw`, {
        toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amountUSDT: 10.5
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 提现成功:', withdrawResponse.data);
      
    } else {
      console.log('❌ 登录失败');
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testCustomWithdraw(); 