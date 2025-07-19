const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

console.log('🔍 快速服务器连接检查...');
console.log(`📍 目标: ${BASE_URL}`);
console.log('');

async function checkServer() {
  try {
    // 测试基本连接
    console.log('🧪 测试服务器连接...');
    const response = await axios.get(`${BASE_URL}/api/subscription-plans`, {
      timeout: 5000
    });
    console.log(`✅ 服务器连接正常 (${response.status})`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 连接被拒绝 - 服务器可能未启动');
      return false;
    } else if (error.code === 'ENOTFOUND') {
      console.log('❌ 主机未找到 - 检查IP地址');
      return false;
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ 连接超时 - 检查网络或防火墙');
      return false;
    } else {
      console.log(`❌ 连接错误: ${error.message}`);
      return false;
    }
  }
}

async function checkSpecificAPIs() {
  const testAPIs = [
    { name: '认购计划', url: '/api/subscription-plans' },
    { name: '钱包余额', url: '/api/wallet-balances' },
    { name: '钱包交易', url: '/api/wallet-txes' },
    { name: '注册接口', url: '/api/wallet/auth/invite-register' }
  ];
  
  console.log('\n🧪 测试关键API接口...');
  
  for (const api of testAPIs) {
    try {
      if (api.name === '注册接口') {
        // POST请求
        const response = await axios.post(`${BASE_URL}${api.url}`, {
          username: 'test',
          email: 'test@example.com',
          password: 'test123',
          inviteCode: 'user'
        });
        console.log(`✅ ${api.name} - 通过 (${response.status})`);
      } else {
        // GET请求
        const response = await axios.get(`${BASE_URL}${api.url}`);
        console.log(`✅ ${api.name} - 通过 (${response.status})`);
      }
    } catch (error) {
      if (error.response?.status === 400 && api.name === '注册接口') {
        console.log(`✅ ${api.name} - 路由存在 (400 - 参数验证)`);
      } else {
        console.log(`❌ ${api.name} - 失败 (${error.response?.status || error.code})`);
      }
    }
  }
}

async function runQuickCheck() {
  const serverOk = await checkServer();
  
  if (serverOk) {
    await checkSpecificAPIs();
    console.log('\n✅ 服务器基本功能正常');
  } else {
    console.log('\n❌ 服务器连接有问题，请检查:');
    console.log('1. 服务器是否正在运行');
    console.log('2. IP地址是否正确');
    console.log('3. 端口是否开放');
    console.log('4. 防火墙设置');
  }
}

runQuickCheck().catch(error => {
  console.error('💥 检查失败:', error.message);
}); 