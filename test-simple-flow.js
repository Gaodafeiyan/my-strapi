const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testSimpleFlow() {
  console.log('🚀 开始测试简化流程：注册 → 充值 → 提现');
  
  let token = null;
  let userId = null;
  
  try {
    // 1. 用户注册
    console.log('\n1️⃣ 用户注册...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: 'testuser' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: '123456',
      inviteCode: 'user'
    });

    console.log('✅ 注册成功:', {
      userId: registerResponse.data.user?.id,
      username: registerResponse.data.user?.username,
      email: registerResponse.data.user?.email
    });
    
    // 2. 使用注册时的token
    console.log('\n2️⃣ 使用注册时的token...');
    token = registerResponse.data.jwt;
    userId = registerResponse.data.user.id;
    console.log('✅ 使用注册token成功');
    
    // 3. 检查钱包余额（初始状态）
    console.log('\n3️⃣ 检查初始钱包余额...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 钱包余额:', balanceResponse.data);
    } catch (error) {
      console.log('❌ 余额查询失败:', error.response?.data);
    }

    // 4. 检查充值地址
    console.log('\n4️⃣ 检查充值地址...');
    try {
      const depositResponse = await axios.get(`${BASE_URL}/api/deposit-addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 充值地址:', depositResponse.data);
    } catch (error) {
      console.log('❌ 充值地址查询失败:', error.response?.data);
    }

    // 5. 测试提现API（余额不足时应该失败）
    console.log('\n5️⃣ 测试提现API（余额不足）...');
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
      console.log('❌ 提现失败（预期）:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // 6. 检查提现请求状态
    console.log('\n6️⃣ 检查提现请求状态...');
    try {
      const withdrawRequestsResponse = await axios.get(`${BASE_URL}/api/withdraw-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 提现请求列表:', withdrawRequestsResponse.data);
    } catch (error) {
      console.log('❌ 提现请求查询失败:', error.response?.data);
    }

    // 7. 检查钱包交易记录
    console.log('\n7️⃣ 检查钱包交易记录...');
    try {
      const walletTxResponse = await axios.get(`${BASE_URL}/api/wallet-txes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 钱包交易记录:', walletTxResponse.data);
    } catch (error) {
      console.log('❌ 钱包交易查询失败:', error.response?.data);
    }

    console.log('\n🎉 简化流程测试完成！');
    
  } catch (error) {
    console.log('❌ 测试失败:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testSimpleFlow(); 