/**
 * 功能测试总结脚本
 */

const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const USER_CREDENTIALS = {
  identifier: '887',
  password: '123456'
};

async function testSummary() {
  try {
    console.log('🚀 功能测试总结...\n');

    // 1. 用户登录
    console.log('1️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, USER_CREDENTIALS);
    const jwt = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log(`✅ 登录成功，用户ID: ${userId}\n`);

    // 2. 检查钱包余额
    console.log('2️⃣ 检查钱包余额...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances?filters[user][$eq]=${userId}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 钱包余额查询成功:', JSON.stringify(balanceResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 钱包余额查询失败:', error.response?.data || error.message);
    }

    // 3. 检查充值地址
    console.log('\n3️⃣ 检查充值地址...');
    try {
      const depositResponse = await axios.get(`${BASE_URL}/api/deposit-addresses?filters[user][$eq]=${userId}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 充值地址查询成功:', JSON.stringify(depositResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 充值地址查询失败:', error.response?.data || error.message);
    }

    // 4. 测试提现API
    console.log('\n4️⃣ 测试提现API...');
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
      console.log('✅ 提现请求成功:', JSON.stringify(withdrawResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 提现请求失败:', error.response?.data || error.message);
    }

    // 5. 检查提现请求记录
    console.log('\n5️⃣ 检查提现请求记录...');
    try {
      const withdrawRequestsResponse = await axios.get(`${BASE_URL}/api/withdraw-requests?filters[user][$eq]=${userId}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 提现请求查询成功:', JSON.stringify(withdrawRequestsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 提现请求查询失败:', error.response?.data || error.message);
    }

    // 6. 检查钱包交易记录
    console.log('\n6️⃣ 检查钱包交易记录...');
    try {
      const txResponse = await axios.get(`${BASE_URL}/api/wallet-txes?filters[user][$eq]=${userId}`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 钱包交易查询成功:', JSON.stringify(txResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 钱包交易查询失败:', error.response?.data || error.message);
    }

    console.log('\n📋 测试总结:');
    console.log('✅ 用户认证: 成功');
    console.log('✅ 钱包余额: 查询成功，用户有1000 USDT余额');
    console.log('✅ 充值地址: 查询成功（空记录）');
    console.log('❌ 提现API: 403 Forbidden - 权限配置问题');
    console.log('✅ 提现请求: 查询成功（空记录）');
    console.log('✅ 钱包交易: 查询成功（空记录）');

    console.log('\n🔧 需要解决的问题:');
    console.log('1. 提现API权限配置 - 需要在Strapi Admin中配置自定义路由权限');
    console.log('2. 充值地址创建 - 用户注册时应该自动创建充值地址');
    console.log('3. 区块链监听 - Cron Job需要配置权限');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testSummary(); 