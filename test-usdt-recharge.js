const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
let authToken = '';

// 登录获取token
async function login() {
  try {
    console.log('🔐 正在登录...');
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: '887',
      password: '123456'
    });

    if (response.status === 200) {
      authToken = response.data.jwt;
      console.log('✅ 登录成功');
      console.log(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ 登录失败');
      return false;
    }
  } catch (error) {
    console.log('❌ 登录异常:', error.response?.data || error.message);
    return false;
  }
}

// 获取钱包余额
async function getWalletBalance() {
  try {
    console.log('\n💰 获取钱包余额...');
    const response = await axios.get(`${BASE_URL}/api/wallet-balances`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('✅ 钱包余额获取成功');
      console.log('数据:', JSON.stringify(response.data, null, 2));
      return response.data;
    } else {
      console.log('❌ 钱包余额获取失败');
      return null;
    }
  } catch (error) {
    console.log('❌ 钱包余额获取异常:', error.response?.data || error.message);
    return null;
  }
}

// 测试USDT充值
async function testRechargeUSDT(amount) {
  try {
    console.log(`\n💸 测试USDT充值 (金额: ${amount})...`);
    const response = await axios.post(`${BASE_URL}/api/wallet-balances/recharge-usdt`, {
      amount: amount
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('✅ USDT充值成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data;
    } else {
      console.log('❌ USDT充值失败');
      console.log('错误信息:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ USDT充值异常:', error.response?.data || error.message);
    return null;
  }
}

// 测试充值金额验证
async function testRechargeValidation() {
  console.log('\n🧪 测试充值金额验证...');
  
  // 测试负数金额
  console.log('测试负数金额:');
  await testRechargeUSDT(-100);
  
  // 测试零金额
  console.log('\n测试零金额:');
  await testRechargeUSDT(0);
  
  // 测试无效金额
  console.log('\n测试无效金额:');
  try {
    const response = await axios.post(`${BASE_URL}/api/wallet-balances/recharge-usdt`, {
      amount: 'invalid'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('❌ 应该失败但成功了');
  } catch (error) {
    console.log('✅ 正确拒绝了无效金额');
  }
}

// 测试多次充值
async function testMultipleRecharge() {
  console.log('\n🔄 测试多次充值...');
  
  // 第一次充值
  console.log('第一次充值 50 USDT:');
  await testRechargeUSDT(50);
  
  // 查看余额
  await getWalletBalance();
  
  // 第二次充值
  console.log('\n第二次充值 30 USDT:');
  await testRechargeUSDT(30);
  
  // 查看最终余额
  await getWalletBalance();
}

// 测试小数金额
async function testDecimalRecharge() {
  console.log('\n🔢 测试小数金额充值...');
  
  // 测试小数金额
  console.log('充值 12.345 USDT:');
  await testRechargeUSDT(12.345);
  
  // 查看余额
  await getWalletBalance();
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始USDT充值功能测试...\n');
  
  // 登录
  if (!await login()) {
    console.log('❌ 登录失败，无法继续测试');
    return;
  }
  
  // 获取初始余额
  console.log('\n📊 获取初始钱包余额:');
  await getWalletBalance();
  
  // 测试正常充值
  await testRechargeUSDT(100);
  
  // 查看充值后余额
  await getWalletBalance();
  
  // 测试金额验证
  await testRechargeValidation();
  
  // 测试多次充值
  await testMultipleRecharge();
  
  // 测试小数金额
  await testDecimalRecharge();
  
  console.log('\n🎉 USDT充值功能测试完成！');
}

// 运行测试
runTests().catch(console.error); 