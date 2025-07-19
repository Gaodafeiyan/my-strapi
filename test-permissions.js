const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 获取认证token
async function getAuthToken() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: 'testuser877',
      password: '123456'
    });
    
    if (response.data.jwt) {
      console.log('✅ 获取认证token成功');
      return response.data.jwt;
    }
  } catch (error) {
    console.log('❌ 获取认证token失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试不同权限级别的API
async function testPermissions(token) {
  console.log('\n🔐 测试API权限配置...\n');
  
  const apis = [
    { name: '钱包余额 (GET)', url: '/api/wallet-balances', method: 'GET' },
    { name: '钱包余额 (POST)', url: '/api/wallet-balances', method: 'POST' },
    { name: 'USDT充值', url: '/api/wallet-balances/recharge-usdt', method: 'POST' },
    { name: 'USDT提现', url: '/api/usdt-withdraws', method: 'POST' },
    { name: 'AI代币提现', url: '/api/ai-token-withdraws', method: 'POST' },
    { name: '充值记录', url: '/api/recharge-records', method: 'GET' },
    { name: '充值地址', url: '/api/deposit-addresses', method: 'GET' }
  ];
  
  for (const api of apis) {
    try {
      console.log(`测试 ${api.name}...`);
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      let response;
      if (api.method === 'GET') {
        response = await axios.get(`${BASE_URL}${api.url}`, config);
      } else if (api.method === 'POST') {
        const data = api.name.includes('充值') ? { amount: 100 } : 
                    api.name.includes('提现') ? { amount: 50, address: '0x123...' } : {};
        
        response = await axios.post(`${BASE_URL}${api.url}`, data, config);
      }
      
      console.log(`✅ ${api.name} 正常 (${response.status})`);
      if (response.data && response.data.data) {
        console.log(`   返回数据: ${JSON.stringify(response.data.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${api.name} 失败: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
      
      // 提供具体的权限配置建议
      if (error.response?.status === 403) {
        console.log(`   💡 需要在Strapi管理后台配置权限:`);
        console.log(`   Settings → Users & Permissions → Roles → Authenticated`);
        console.log(`   勾选对应的API权限`);
      }
    }
  }
}

// 测试无认证访问
async function testWithoutAuth() {
  console.log('\n🔓 测试无认证访问...\n');
  
  const apis = [
    { name: '钱包余额', url: '/api/wallet-balances' },
    { name: '充值地址', url: '/api/deposit-addresses' }
  ];
  
  for (const api of apis) {
    try {
      console.log(`测试 ${api.name} (无认证)...`);
      const response = await axios.get(`${BASE_URL}${api.url}`);
      console.log(`✅ ${api.name} 无认证访问正常 (${response.status})`);
    } catch (error) {
      console.log(`❌ ${api.name} 无认证访问失败: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试API权限配置...\n');
  
  // 测试无认证访问
  await testWithoutAuth();
  
  // 获取认证token
  const token = await getAuthToken();
  
  if (token) {
    // 测试有认证的API访问
    await testPermissions(token);
  } else {
    console.log('❌ 无法获取认证token，无法测试需要认证的API');
  }
  
  console.log('\n📋 权限配置建议:');
  console.log('1. 登录Strapi管理后台: http://118.107.4.158:1337/admin');
  console.log('2. 进入 Settings → Users & Permissions → Roles');
  console.log('3. 选择 "Authenticated" 角色');
  console.log('4. 为以下API勾选权限:');
  console.log('   - wallet-balance: find, findOne, create, update');
  console.log('   - usdt-withdraw: find, findOne, create');
  console.log('   - ai-token-withdraw: find, findOne, create');
  console.log('   - recharge-record: find, findOne');
  console.log('   - deposit-address: find, findOne');
}

main().catch(console.error); 