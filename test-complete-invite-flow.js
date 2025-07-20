const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testCompleteInviteFlow() {
  console.log('🧪 完整邀请流程测试...');
  
  try {
    // 1. 普通注册创建邀请人
    console.log('1. 普通注册创建邀请人...');
    const timestamp = Date.now();
    const inviterResponse = await axios.post(`${BASE_URL}/api/auth/local/register`, {
      username: 'inviter' + timestamp,
      email: 'inviter' + timestamp + '@example.com',
      password: 'test123456'
    });
    
    if (inviterResponse.data.user?.referralCode) {
      console.log('✅ 邀请人创建成功');
      console.log('   用户ID:', inviterResponse.data.user.id);
      console.log('   邀请码:', inviterResponse.data.user.referralCode);
      console.log('   DiamondID:', inviterResponse.data.user.diamondId);
      
      // 2. 使用邀请码注册新用户
      console.log('\n2. 使用邀请码注册新用户...');
      const inviteeResponse = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, {
        username: 'invitee' + timestamp,
        email: 'invitee' + timestamp + '@example.com',
        password: 'test123456',
        inviteCode: inviterResponse.data.user.referralCode
      });
      
      if (inviteeResponse.data.jwt) {
        console.log('✅ 邀请码注册成功');
        console.log('   用户ID:', inviteeResponse.data.user.id);
        console.log('   邀请码:', inviteeResponse.data.user.referralCode);
        console.log('   DiamondID:', inviteeResponse.data.user.diamondId);
        console.log('   邀请人ID:', inviteeResponse.data.user.invitedBy);
        
        // 3. 测试钱包API
        console.log('\n3. 测试钱包API...');
        const walletResponse = await axios.get(`${BASE_URL}/api/wallet-balances`, {
          headers: {
            'Authorization': `Bearer ${inviteeResponse.data.jwt}`
          }
        });
        console.log('✅ 钱包余额查询成功:', walletResponse.data);
        
        // 4. 测试充值地址API
        const addressResponse = await axios.get(`${BASE_URL}/api/wallet-balances/deposit-address`, {
          headers: {
            'Authorization': `Bearer ${inviteeResponse.data.jwt}`
          }
        });
        console.log('✅ 充值地址查询成功:', addressResponse.data);
        
      } else {
        console.log('❌ 邀请码注册失败:', inviteeResponse.data);
      }
    } else {
      console.log('❌ 邀请人创建失败:', inviterResponse.data);
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.response?.data || error.message);
  }
}

testCompleteInviteFlow(); 