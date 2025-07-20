const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testInviteRegister() {
  console.log('🧪 测试邀请码注册...');
  
  try {
    // 1. 先创建一个用户作为邀请人
    console.log('1. 创建邀请人用户...');
    const inviterResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'inviter',
      email: 'inviter@example.com',
      password: 'test123456'
    });
    
    if (inviterResponse.data.user?.referralCode) {
      console.log('邀请人创建成功，邀请码:', inviterResponse.data.user.referralCode);
      
      // 2. 使用邀请码注册新用户
      console.log('\n2. 使用邀请码注册新用户...');
      const inviteeResponse = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, {
        username: 'invitee',
        email: 'invitee@example.com',
        password: 'test123456',
        inviteCode: inviterResponse.data.user.referralCode
      });
      
      if (inviteeResponse.data.jwt) {
        console.log('邀请码注册成功:', inviteeResponse.data);
      } else {
        console.log('邀请码注册失败:', inviteeResponse.data);
      }
    } else {
      console.log('邀请人创建失败:', inviterResponse.data);
    }
    
  } catch (error) {
    console.log('测试失败:', error.response?.data || error.message);
  }
}

testInviteRegister(); 