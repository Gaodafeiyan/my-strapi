const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function debugRegister() {
  console.log('🔍 调试注册过程...');
  
  try {
    const timestamp = Date.now();
    
    // 1. 测试普通注册
    console.log('1. 发送注册请求...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'debuguser' + timestamp,
      email: 'debug' + timestamp + '@example.com',
      password: 'test123456'
    });
    
    console.log('注册响应状态:', registerResponse.status);
    console.log('注册响应数据:', JSON.stringify(registerResponse.data, null, 2));
    
    // 2. 检查用户字段
    if (registerResponse.data.user) {
      console.log('\n用户字段检查:');
      console.log('  id:', registerResponse.data.user.id);
      console.log('  username:', registerResponse.data.user.username);
      console.log('  email:', registerResponse.data.user.email);
      console.log('  diamondId:', registerResponse.data.user.diamondId);
      console.log('  referralCode:', registerResponse.data.user.referralCode);
      console.log('  confirmed:', registerResponse.data.user.confirmed);
      console.log('  blocked:', registerResponse.data.user.blocked);
      console.log('  createdAt:', registerResponse.data.user.createdAt);
      console.log('  updatedAt:', registerResponse.data.user.updatedAt);
    }
    
    // 3. 检查JWT
    if (registerResponse.data.jwt) {
      console.log('\nJWT检查:');
      console.log('  JWT长度:', registerResponse.data.jwt.length);
      console.log('  JWT前50字符:', registerResponse.data.jwt.substring(0, 50) + '...');
    }
    
  } catch (error) {
    console.log('调试失败:', error.response?.data || error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应头:', error.response.headers);
    }
  }
}

debugRegister(); 