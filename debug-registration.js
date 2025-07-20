const axios = require('axios');

(async () => {
  try {
    console.log('🔍 开始调试注册流程...');
    
    // 1. 测试基本连接
    console.log('\n1️⃣ 测试API连接...');
    try {
      const healthCheck = await axios.get('http://118.107.4.158:1337/api/health');
      console.log('✅ API连接正常');
    } catch (error) {
      console.log('❌ API连接失败:', error.message);
      return;
    }

    // 2. 测试注册
    console.log('\n2️⃣ 测试用户注册...');
    const username = 'debug_' + Date.now();
    const email = `debug_${Date.now()}@test.com`;
    
    const { data } = await axios.post('http://118.107.4.158:1337/api/auth/local/register', {
      username,
      email,
      password: 'Test1234!',
    });
    
    console.log('注册响应:', JSON.stringify(data, null, 2));
    
    // 3. 检查字段
    console.log('\n3️⃣ 检查生成字段...');
    console.log('diamondId:', data.user?.diamondId);
    console.log('referralCode:', data.user?.referralCode);
    console.log('用户ID:', data.user?.id);
    
    if (data.user?.diamondId && data.user?.referralCode) {
      console.log('✅ 字段生成成功');
    } else {
      console.log('❌ 字段未生成');
      
      // 4. 尝试直接查询用户
      console.log('\n4️⃣ 尝试直接查询用户...');
      try {
        const userResponse = await axios.get(`http://118.107.4.158:1337/api/users/${data.user.id}`);
        console.log('直接查询用户:', JSON.stringify(userResponse.data, null, 2));
      } catch (error) {
        console.log('直接查询失败:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ 调试失败:', error.response?.data || error.message);
  }
})(); 