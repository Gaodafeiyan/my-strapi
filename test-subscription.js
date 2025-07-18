const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testSubscription() {
  console.log('🚀 测试认购系统...');
  
  let token = null;
  
  try {
    // 1. 用户注册
    console.log('\n1️⃣ 用户注册...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
      username: 'subscriptionuser' + Date.now(),
      email: `subscriptionuser${Date.now()}@example.com`,
      password: '123456',
      inviteCode: 'user'
    });

    console.log('✅ 注册成功');
    token = registerResponse.data.jwt;
    
    // 2. 检查钱包余额
    console.log('\n2️⃣ 检查钱包余额...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 钱包余额:', balanceResponse.data);
    } catch (error) {
      console.log('❌ 余额查询失败:', error.response?.data);
    }

    // 3. 查看认购计划
    console.log('\n3️⃣ 查看认购计划...');
    try {
      const plansResponse = await axios.get(`${BASE_URL}/api/subscription-plans`);
      console.log('✅ 认购计划:', plansResponse.data);
    } catch (error) {
      console.log('❌ 认购计划查询失败:', error.response?.data);
    }

    // 4. 测试认购下单
    console.log('\n4️⃣ 测试认购下单...');
    try {
      const subscriptionResponse = await axios.post(`${BASE_URL}/api/subscription-orders`, {
        data: {
          planId: 1, // 假设计划ID为1
          quantity: 1
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 认购下单成功:', subscriptionResponse.data);
    } catch (error) {
      console.log('❌ 认购下单失败:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // 5. 查看认购订单
    console.log('\n5️⃣ 查看认购订单...');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/api/subscription-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 认购订单:', ordersResponse.data);
    } catch (error) {
      console.log('❌ 认购订单查询失败:', error.response?.data);
    }

    // 6. 查看钱包交易记录
    console.log('\n6️⃣ 查看钱包交易记录...');
    try {
      const walletTxResponse = await axios.get(`${BASE_URL}/api/wallet-txes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 钱包交易记录:', walletTxResponse.data);
    } catch (error) {
      console.log('❌ 钱包交易查询失败:', error.response?.data);
    }

    // 7. 查看返佣记录
    console.log('\n7️⃣ 查看返佣记录...');
    try {
      const referralResponse = await axios.get(`${BASE_URL}/api/referral-rewards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ 返佣记录:', referralResponse.data);
    } catch (error) {
      console.log('❌ 返佣记录查询失败:', error.response?.data);
    }

    console.log('\n🎉 认购系统测试完成！');
    
  } catch (error) {
    console.log('❌ 测试失败:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testSubscription(); 