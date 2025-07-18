const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testExistingUser() {
  console.log('🚀 测试现有用户登录和提现...');
  
  try {
    // 1. 尝试登录现有用户
    console.log('1️⃣ 尝试登录现有用户...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser@example.com',
      password: '123456'
    });

    if (loginResponse.data.jwt) {
      console.log('✅ 登录成功');
      const token = loginResponse.data.jwt;
      
      // 2. 检查钱包余额
      console.log('2️⃣ 检查钱包余额...');
      try {
        const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ 钱包余额:', balanceResponse.data);
      } catch (error) {
        console.log('❌ 余额查询失败:', error.response?.data);
      }

      // 3. 测试自定义提现API
      console.log('3️⃣ 测试自定义提现API...');
      try {
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
      } catch (error) {
        console.log('❌ 提现失败:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }

      // 4. 测试标准提现API
      console.log('4️⃣ 测试标准提现API...');
      try {
        const standardWithdrawResponse = await axios.post(`${BASE_URL}/api/withdraw-requests`, {
          data: {
            toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            amountUSDT: 5.5
          }
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ 标准提现成功:', standardWithdrawResponse.data);
      } catch (error) {
        console.log('❌ 标准提现失败:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      
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

testExistingUser(); 