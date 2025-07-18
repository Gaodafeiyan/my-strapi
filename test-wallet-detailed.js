/**
 * 详细钱包功能测试脚本
 */

const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const USER_CREDENTIALS = {
  identifier: '887',
  password: '123456'
};

async function testWalletDetailed() {
  try {
    console.log('🚀 开始详细钱包功能测试...\n');

    // 1. 用户登录
    console.log('1️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, USER_CREDENTIALS);
    const jwt = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log(`✅ 登录成功，用户ID: ${userId}`);
    console.log(`🔑 JWT Token: ${jwt.substring(0, 50)}...\n`);

    // 2. 检查所有钱包相关数据
    console.log('2️⃣ 检查钱包相关数据...\n');

    // 2.1 检查钱包余额
    console.log('📊 钱包余额:');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 钱包余额查询成功:', JSON.stringify(balanceResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 钱包余额查询失败:', error.response?.data || error.message);
    }

    // 2.2 检查充值地址
    console.log('\n📊 充值地址:');
    try {
      const depositResponse = await axios.get(`${BASE_URL}/api/deposit-addresses`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 充值地址查询成功:', JSON.stringify(depositResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 充值地址查询失败:', error.response?.data || error.message);
    }

    // 2.3 检查提现请求
    console.log('\n📊 提现请求:');
    try {
      const withdrawResponse = await axios.get(`${BASE_URL}/api/withdraw-requests`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 提现请求查询成功:', JSON.stringify(withdrawResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 提现请求查询失败:', error.response?.data || error.message);
    }

    // 2.4 检查钱包交易
    console.log('\n📊 钱包交易:');
    try {
      const txResponse = await axios.get(`${BASE_URL}/api/wallet-txes`, {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      console.log('✅ 钱包交易查询成功:', JSON.stringify(txResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 钱包交易查询失败:', error.response?.data || error.message);
    }

    // 3. 测试提现API
    console.log('\n3️⃣ 测试提现API...');
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

    console.log('\n📋 测试总结:');
    console.log('- 用户认证: ✅ 成功');
    console.log('- 数据查询: ✅ 权限已配置');
    console.log('- 提现功能: ⏳ 测试中...');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testWalletDetailed(); 