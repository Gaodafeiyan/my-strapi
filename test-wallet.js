/**
 * 钱包功能测试脚本
 * 模拟充值提现流程
 */

const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const USER_CREDENTIALS = {
  identifier: '887',
  password: '123456'
};

async function testWalletFlow() {
  try {
    console.log('🚀 开始钱包功能测试...\n');

    // 1. 用户登录获取JWT
    console.log('1️⃣ 用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, USER_CREDENTIALS);
    const jwt = loginResponse.data.jwt;
    const userId = loginResponse.data.user.id;
    console.log(`✅ 登录成功，用户ID: ${userId}`);
    console.log(`🔑 JWT Token: ${jwt.substring(0, 50)}...\n`);

    // 2. 测试提现API（预期会失败，因为没有余额）
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
      console.log('✅ 提现请求成功:', withdrawResponse.data);
    } catch (error) {
      console.log('❌ 提现请求失败:', error.response?.data || error.message);
    }

    // 3. 检查钱包余额API
    console.log('\n3️⃣ 检查钱包余额API...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances?filters[user][$eq]=${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ 钱包余额查询成功:', balanceResponse.data);
    } catch (error) {
      console.log('❌ 钱包余额查询失败:', error.response?.data || error.message);
    }

    // 4. 检查充值地址API
    console.log('\n4️⃣ 检查充值地址API...');
    try {
      const depositAddressResponse = await axios.get(`${BASE_URL}/api/deposit-addresses?filters[user][$eq]=${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      console.log('✅ 充值地址查询成功:', depositAddressResponse.data);
    } catch (error) {
      console.log('❌ 充值地址查询失败:', error.response?.data || error.message);
    }

    console.log('\n📋 测试总结:');
    console.log('- 用户认证: ✅ 成功');
    console.log('- API权限: ❌ 需要配置Strapi权限');
    console.log('- 提现功能: ⏳ 等待权限配置');
    console.log('- 充值功能: ⏳ 等待权限配置');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testWalletFlow(); 