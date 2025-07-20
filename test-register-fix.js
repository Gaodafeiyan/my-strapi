const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testRegisterFix() {
  console.log('🧪 测试注册修复...');
  
  try {
    const timestamp = Date.now();
    
    // 1. 测试普通注册
    console.log('1. 测试普通注册...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'testuser' + timestamp,
      email: 'test' + timestamp + '@example.com',
      password: 'test123456'
    });
    
    console.log('普通注册结果:');
    console.log('  JWT:', registerResponse.data.jwt ? '✅ 有JWT' : '❌ 无JWT');
    console.log('  DiamondID:', registerResponse.data.user?.diamondId || '❌ 无DiamondID');
    console.log('  ReferralCode:', registerResponse.data.user?.referralCode || '❌ 无ReferralCode');
    
    if (registerResponse.data.user?.referralCode) {
      // 2. 测试邀请码注册
      console.log('\n2. 测试邀请码注册...');
      const inviteResponse = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, {
        username: 'invitee' + timestamp,
        email: 'invitee' + timestamp + '@example.com',
        password: 'test123456',
        inviteCode: registerResponse.data.user.referralCode
      });
      
      console.log('邀请码注册结果:');
      console.log('  JWT:', inviteResponse.data.jwt ? '✅ 有JWT' : '❌ 无JWT');
      console.log('  DiamondID:', inviteResponse.data.user?.diamondId || '❌ 无DiamondID');
      console.log('  ReferralCode:', inviteResponse.data.user?.referralCode || '❌ 无ReferralCode');
      console.log('  InvitedBy:', inviteResponse.data.user?.invitedBy || '❌ 无InvitedBy');
    }
    
  } catch (error) {
    console.log('测试失败:', error.response?.data || error.message);
  }
}

testRegisterFix(); 

const BASE_URL = 'http://118.107.4.158:1337';

async function testRegisterFix() {
  console.log('🧪 测试注册修复...');
  
  try {
    const timestamp = Date.now();
    
    // 1. 测试普通注册
    console.log('1. 测试普通注册...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'testuser' + timestamp,
      email: 'test' + timestamp + '@example.com',
      password: 'test123456'
    });
    
    console.log('普通注册结果:');
    console.log('  JWT:', registerResponse.data.jwt ? '✅ 有JWT' : '❌ 无JWT');
    console.log('  DiamondID:', registerResponse.data.user?.diamondId || '❌ 无DiamondID');
    console.log('  ReferralCode:', registerResponse.data.user?.referralCode || '❌ 无ReferralCode');
    
    if (registerResponse.data.user?.referralCode) {
      // 2. 测试邀请码注册
      console.log('\n2. 测试邀请码注册...');
      const inviteResponse = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, {
        username: 'invitee' + timestamp,
        email: 'invitee' + timestamp + '@example.com',
        password: 'test123456',
        inviteCode: registerResponse.data.user.referralCode
      });
      
      console.log('邀请码注册结果:');
      console.log('  JWT:', inviteResponse.data.jwt ? '✅ 有JWT' : '❌ 无JWT');
      console.log('  DiamondID:', inviteResponse.data.user?.diamondId || '❌ 无DiamondID');
      console.log('  ReferralCode:', inviteResponse.data.user?.referralCode || '❌ 无ReferralCode');
      console.log('  InvitedBy:', inviteResponse.data.user?.invitedBy || '❌ 无InvitedBy');
    }
    
  } catch (error) {
    console.log('测试失败:', error.response?.data || error.message);
  }
}

testRegisterFix(); 