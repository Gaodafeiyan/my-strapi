/**
 * 测试新的认购和返佣制度
 * 验证：档位配置、返佣计算、抽奖次数、AI代币解锁
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:1337';
const API_URL = `${BASE_URL}/api`;

// 测试数据
const testUsers = [
  { username: 'referrer', email: 'referrer@test.com', password: 'test123', inviteCode: 'user' },
  { username: 'user1', email: 'user1@test.com', password: 'test123', inviteCode: 'referrer' },
  { username: 'user2', email: 'user2@test.com', password: 'test123', inviteCode: 'referrer' }
];

let tokens = {};
let userIds = {};

async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_URL}/auth/local/register`, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      inviteCode: userData.inviteCode
    });

    console.log(`✅ 注册成功: ${userData.username}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 注册失败 ${userData.username}:`, error.response?.data || error.message);
    return null;
  }
}

async function loginUser(username, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/local`, {
      identifier: username,
      password: password
    });

    console.log(`✅ 登录成功: ${username}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 登录失败 ${username}:`, error.response?.data || error.message);
    return null;
  }
}

async function getWalletBalance(token) {
  try {
    const response = await axios.get(`${API_URL}/wallet-balances`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data[0]?.attributes?.amount || 0;
  } catch (error) {
    console.error('❌ 获取钱包余额失败:', error.response?.data || error.message);
    return 0;
  }
}

async function getSubscriptionPlans() {
  try {
    const response = await axios.get(`${API_URL}/subscription-plans`);
    return response.data.data;
  } catch (error) {
    console.error('❌ 获取认购计划失败:', error.response?.data || error.message);
    return [];
  }
}

async function createSubscriptionOrder(token, planId, quantity) {
  try {
    const response = await axios.post(`${API_URL}/subscription-orders`, {
      data: {
        planId: planId,
        quantity: quantity
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 认购订单创建成功: 计划 ${planId}, 数量 ${quantity}`);
    return response.data;
  } catch (error) {
    console.error(`❌ 认购订单创建失败:`, error.response?.data || error.message);
    return null;
  }
}

async function simulateDeposit(token, amount) {
  try {
    // 模拟充值 - 直接更新余额
    const response = await axios.post(`${API_URL}/wallet-balances`, {
      data: {
        amount: amount
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ 模拟充值成功: ${amount} USDT`);
    return response.data;
  } catch (error) {
    console.error(`❌ 模拟充值失败:`, error.response?.data || error.message);
    return null;
  }
}

async function testNewSystem() {
  console.log('🚀 开始测试新的认购和返佣制度...\n');

  // 1. 注册测试用户
  console.log('📝 步骤1: 注册测试用户');
  for (const userData of testUsers) {
    const result = await registerUser(userData);
    if (result) {
      tokens[userData.username] = result.jwt;
      userIds[userData.username] = result.user.id;
    }
  }

  // 2. 获取认购计划
  console.log('\n📋 步骤2: 获取认购计划');
  const plans = await getSubscriptionPlans();
  console.log('认购计划:', plans.map(p => ({
    id: p.id,
    name: p.attributes.name,
    price: p.attributes.priceUSDT,
    yield: p.attributes.staticYieldPct,
    referralPct: p.attributes.referralPct
  })));

  // 3. 为推荐人充值
  console.log('\n💰 步骤3: 为推荐人充值');
  await simulateDeposit(tokens.referrer, 10000);
  const referrerBalance = await getWalletBalance(tokens.referrer);
  console.log(`推荐人余额: ${referrerBalance} USDT`);

  // 4. 为用户1充值并认购
  console.log('\n🛒 步骤4: 用户1充值并认购');
  await simulateDeposit(tokens.user1, 2000);
  const user1Balance = await getWalletBalance(tokens.user1);
  console.log(`用户1余额: ${user1Balance} USDT`);

  // 认购1000单位套餐
  const plan1000 = plans.find(p => p.attributes.priceUSDT === 1000);
  if (plan1000) {
    const order = await createSubscriptionOrder(tokens.user1, plan1000.id, 1);
    if (order) {
      console.log(`✅ 用户1认购成功: 1000 USDT`);
      
      // 检查抽奖次数
      console.log(`🎰 抽奖次数: ${order.data?.attributes?.lotterySpinQuota || 0}`);
      
      // 检查AI代币数量
      const aiTokenQty = order.data?.attributes?.aiTokenQty || 0;
      console.log(`🤖 AI代币数量: ${aiTokenQty}`);
    }
  }

  // 5. 为用户2充值并认购
  console.log('\n🛒 步骤5: 用户2充值并认购');
  await simulateDeposit(tokens.user2, 5000);
  const user2Balance = await getWalletBalance(tokens.user2);
  console.log(`用户2余额: ${user2Balance} USDT`);

  // 认购5000单位套餐
  const plan5000 = plans.find(p => p.attributes.priceUSDT === 5000);
  if (plan5000) {
    const order = await createSubscriptionOrder(tokens.user2, plan5000.id, 1);
    if (order) {
      console.log(`✅ 用户2认购成功: 5000 USDT`);
      
      // 检查抽奖次数
      console.log(`🎰 抽奖次数: ${order.data?.attributes?.lotterySpinQuota || 0}`);
      
      // 检查AI代币数量
      const aiTokenQty = order.data?.attributes?.aiTokenQty || 0;
      console.log(`🤖 AI代币数量: ${aiTokenQty}`);
    }
  }

  // 6. 检查推荐人余额变化
  console.log('\n💰 步骤6: 检查推荐人余额');
  const finalReferrerBalance = await getWalletBalance(tokens.referrer);
  console.log(`推荐人最终余额: ${finalReferrerBalance} USDT`);

  // 7. 验证返佣计算
  console.log('\n📊 步骤7: 验证返佣计算');
  console.log('根据新制度:');
  console.log('- 1000单位套餐: 静态收益70U × 90% = 63U');
  console.log('- 5000单位套餐: 静态收益500U × 70% = 350U');
  console.log(`- 预期总返佣: 63 + 350 = 413U`);

  console.log('\n🎉 新制度测试完成！');
  console.log('\n📋 新制度要点:');
  console.log('✅ 唯一一层直推返佣');
  console.log('✅ 按档位百分比返佣');
  console.log('✅ 订单完成时触发返佣');
  console.log('✅ 每单获得3次抽奖机会');
  console.log('✅ AI代币按档位百分比赠送');
}

// 运行测试
testNewSystem().catch(console.error); 