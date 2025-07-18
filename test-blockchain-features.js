const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testBlockchainFeatures() {
  console.log('🚀 测试区块链功能...');
  
  try {
    // 1. 用户注册
    console.log('1️⃣ 用户注册...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: 'blockchainuser',
      email: 'blockchainuser@example.com',
      password: '123456',
      inviteCode: 'user'
    });

    console.log('✅ 注册成功:', registerResponse.data);
    
    // 2. 用户登录
    console.log('2️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'blockchainuser@example.com',
      password: '123456'
    });

    if (loginResponse.data.jwt) {
      console.log('✅ 登录成功');
      const token = loginResponse.data.jwt;
      
      // 3. 检查钱包余额
      console.log('3️⃣ 检查钱包余额...');
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

      // 4. 检查充值地址
      console.log('4️⃣ 检查充值地址...');
      try {
        const depositResponse = await axios.get(`${BASE_URL}/api/deposit-addresses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ 充值地址:', depositResponse.data);
      } catch (error) {
        console.log('❌ 充值地址查询失败:', error.response?.data);
      }

      // 5. 测试提现API
      console.log('5️⃣ 测试提现API...');
      try {
        const withdrawResponse = await axios.post(`${BASE_URL}/api/wallet/withdraw`, {
          toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          amountUSDT: 5.5
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ 提现请求成功:', withdrawResponse.data);
      } catch (error) {
        console.log('❌ 提现失败:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }

      // 6. 检查提现请求状态
      console.log('6️⃣ 检查提现请求状态...');
      try {
        const withdrawRequestsResponse = await axios.get(`${BASE_URL}/api/withdraw-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ 提现请求列表:', withdrawRequestsResponse.data);
      } catch (error) {
        console.log('❌ 提现请求查询失败:', error.response?.data);
      }

      // 7. 检查钱包交易记录
      console.log('7️⃣ 检查钱包交易记录...');
      try {
        const walletTxResponse = await axios.get(`${BASE_URL}/api/wallet-txes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ 钱包交易记录:', walletTxResponse.data);
      } catch (error) {
        console.log('❌ 钱包交易查询失败:', error.response?.data);
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

testBlockchainFeatures(); 