const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 检查Strapi权限配置
async function checkPermissions() {
  try {
    console.log('🔐 检查Strapi权限配置...\n');
    
    // 1. 检查API路由
    console.log('1️⃣ 检查API路由...');
    try {
      const routesResponse = await axios.get(`${BASE_URL}/_health`);
      console.log('✅ 服务器健康检查通过');
    } catch (error) {
      console.log('❌ 服务器连接失败:', error.message);
    }
    
    // 2. 检查钱包余额API权限
    console.log('\n2️⃣ 检查钱包余额API权限...');
    try {
      const balanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`);
      console.log('✅ 钱包余额API可访问（无需认证）');
    } catch (error) {
      console.log('❌ 钱包余额API访问失败:', error.response?.status, error.response?.data?.error?.message);
    }
    
    // 3. 检查充值API权限
    console.log('\n3️⃣ 检查充值API权限...');
    try {
      const rechargeResponse = await axios.post(`${BASE_URL}/api/wallet-balances/recharge-usdt`, {
        amount: 100
      });
      console.log('✅ 充值API可访问（无需认证）');
    } catch (error) {
      console.log('❌ 充值API访问失败:', error.response?.status, error.response?.data?.error?.message);
    }
    
    // 4. 检查认证后的权限
    console.log('\n4️⃣ 检查认证后的权限...');
    try {
      // 先登录
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: '887',
        password: '123456'
      });
      
      const token = loginResponse.data.jwt;
      console.log('✅ 登录成功，获取token');
      
      // 测试认证后的钱包余额API
      const authBalanceResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 认证后钱包余额API可访问');
      
      // 测试认证后的充值API
      const authRechargeResponse = await axios.post(`${BASE_URL}/api/wallet-balances/recharge-usdt`, {
        amount: 100
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ 认证后充值API可访问');
      
    } catch (error) {
      console.log('❌ 认证后API测试失败:', error.response?.status, error.response?.data?.error?.message);
    }
    
    // 5. 检查内容类型
    console.log('\n5️⃣ 检查内容类型...');
    try {
      const contentTypesResponse = await axios.get(`${BASE_URL}/api/content-type-builder/content-types`);
      console.log('✅ 内容类型API可访问');
    } catch (error) {
      console.log('❌ 内容类型API访问失败:', error.response?.status);
    }
    
  } catch (error) {
    console.log('❌ 权限检查异常:', error.message);
  }
}

// 检查路由配置
async function checkRoutes() {
  try {
    console.log('\n🔍 检查路由配置...');
    
    // 检查自定义路由是否存在
    const routes = [
      '/api/wallet-balances',
      '/api/wallet-balances/recharge-usdt',
      '/api/usdt-withdraws',
      '/api/ai-token-withdraws',
      '/api/recharge-records',
      '/api/deposit-addresses'
    ];
    
    for (const route of routes) {
      try {
        const response = await axios.get(`${BASE_URL}${route}`);
        console.log(`✅ ${route} - 可访问`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🔒 ${route} - 需要认证`);
        } else if (error.response?.status === 403) {
          console.log(`🚫 ${route} - 权限不足`);
        } else if (error.response?.status === 404) {
          console.log(`❌ ${route} - 路由不存在`);
        } else {
          console.log(`❓ ${route} - 状态码: ${error.response?.status}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ 路由检查异常:', error.message);
  }
}

// 主函数
async function main() {
  console.log('🚀 开始Strapi权限和路由检查...\n');
  
  await checkPermissions();
  await checkRoutes();
  
  console.log('\n🎉 检查完成！');
}

main().catch(console.error); 