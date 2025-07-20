const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testSimpleRegister() {
  console.log('🧪 简单注册测试...');
  
  try {
    const timestamp = Date.now();
    console.log('测试普通注册...');
    const response = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'testuser' + timestamp,
      email: 'test' + timestamp + '@example.com',
      password: 'test123456'
    });
    
    console.log('注册结果:', JSON.stringify(response.data, null, 2));
    
    if (response.data.user?.referralCode && response.data.user?.diamondId) {
      console.log('✅ 注册成功，包含referralCode和diamondId');
    } else {
      console.log('❌ 注册成功，但缺少referralCode或diamondId');
    }
    
  } catch (error) {
    console.log('注册失败:', error.response?.data || error.message);
  }
}

testSimpleRegister(); 