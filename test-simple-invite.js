const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testSimpleInvite() {
  console.log('🧪 简单邀请码测试...');
  
  try {
    // 直接测试邀请码注册，使用一个简单的邀请码
    console.log('测试邀请码注册...');
    const timestamp = Date.now();
    const response = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, {
      username: 'testuser' + timestamp,
      email: 'test' + timestamp + '@example.com',
      password: 'test123456',
      inviteCode: 'TEST123'  // 使用一个简单的测试邀请码
    });
    
    console.log('邀请码注册结果:', response.data);
    
  } catch (error) {
    console.log('邀请码注册失败:', error.response?.data || error.message);
  }
}

testSimpleInvite(); 
testSimpleInvite(); 