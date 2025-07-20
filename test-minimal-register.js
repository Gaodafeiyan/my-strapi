const axios = require('axios');

(async () => {
  try {
    const { data } = await axios.post('http://118.107.4.158:1337/api/auth/local/register', {
      username: 'u' + Date.now(),
      email: `${Date.now()}@ex.com`,
      password: 'Test1234!',
    });
    
    console.log('diamondId:', data.user.diamondId);
    console.log('referralCode:', data.user.referralCode);
    
    if (data.user.diamondId && data.user.referralCode) {
      console.log('✅ 注册成功，字段已自动生成');
    } else {
      console.log('❌ 注册成功，但字段未生成');
    }
  } catch (error) {
    console.log('注册失败:', error.response?.data || error.message);
  }
})(); 