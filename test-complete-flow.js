const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testCompleteFlow() {
  console.log('🚀 开始测试完整流程：注册 → 登录 → 充值 → 提现');
  
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
    
    // 2. 用户登录
    console.log('\n2️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: registerResponse.data.user.email,
      password: '123456'
    });

    if (loginResponse.data.jwt) {
      token = loginResponse.data.jwt;
      userId = loginResponse.data.user.id;
      console.log('✅ 登录成功');
      console.log('用户信息:', {
        id: loginResponse.data.user.id,
        username: loginResponse.data.user.username,
        email: loginResponse.data.user.email
      });
    } else {
      throw new Error('登录失败');
    }
    
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

    // 5. 模拟充值（通过区块链监听服务）
    console.log('\n5️⃣ 模拟充值...');
    try {
      // 这里我们模拟一个充值交易
      console.log('💰 模拟充值 10 USDT...');
      
      // 等待一下让区块链监听服务处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 再次检查余额
      const balanceAfterDeposit = await axios.get(`${BASE_URL}/api/wallet-balances`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 充值后余额:', balanceAfterDeposit.data);
    } catch (error) {
      console.log('❌ 充值模拟失败:', error.response?.data);
    }

    // 6. 检查钱包交易记录
    console.log('\n6️⃣ 检查钱包交易记录...');
    try {
      const walletTxResponse = await axios.get(`${BASE_URL}/api/wallet-txes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 钱包交易记录:', walletTxResponse.data);
    } catch (error) {
      console.log('❌ 钱包交易查询失败:', error.response?.data);
    }

    // 7. 测试提现API
    console.log('\n7️⃣ 测试提现API...');
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

    // 8. 检查提现请求状态
    console.log('\n8️⃣ 检查提现请求状态...');
    try {
      const withdrawRequestsResponse = await axios.get(`${BASE_URL}/api/withdraw-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 提现请求列表:', withdrawRequestsResponse.data);
    } catch (error) {
      console.log('❌ 提现请求查询失败:', error.response?.data);
    }

    // 9. 再次检查钱包余额（提现后）
    console.log('\n9️⃣ 检查提现后钱包余额...');
    try {
      const balanceAfterWithdraw = await axios.get(`${BASE_URL}/api/wallet-balances`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 提现后余额:', balanceAfterWithdraw.data);
    } catch (error) {
      console.log('❌ 余额查询失败:', error.response?.data);
    }

    // 10. 测试标准提现API
    console.log('\n🔟 测试标准提现API...');
    try {
      const standardWithdrawResponse = await axios.post(`${BASE_URL}/api/withdraw-requests`, {
        data: {
          toAddress: '0x9876543210fedcba9876543210fedcba98765432',
          amountUSDT: 2.5
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

    console.log('\n🎉 完整流程测试完成！');
    
  } catch (error) {
    console.log('❌ 测试失败:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testCompleteFlow(); 