const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试登录
async function testLogin() {
  try {
    console.log('🔐 测试登录...');
    
    // 使用实际的用户信息
    const loginData = [
      { identifier: '887', password: '123456' },
      { identifier: 'testuser', password: '123456' },
      { identifier: 'testuser2', password: '123456' },
      { identifier: 'test887', password: '123456' },
      { identifier: 'testuser888', password: '123456' },
      { identifier: 'testuser3', password: '123456' },
      { identifier: 'blockchainuser', password: '123456' },
      { identifier: 'testuser877', password: '123456' }
    ];
    
    for (let i = 0; i < loginData.length; i++) {
      const data = loginData[i];
      console.log(`\n尝试登录方式 ${i + 1}:`, data);
      
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/local`, data);
        
        if (response.status === 200) {
          console.log('✅ 登录成功!');
          console.log('用户信息:', response.data.user);
          console.log('Token:', response.data.jwt.substring(0, 20) + '...');
          return response.data;
        }
      } catch (error) {
        console.log('❌ 登录失败:', error.response?.data?.error?.message || error.message);
      }
    }
    
    console.log('\n❌ 所有登录方式都失败了');
    return null;
    
  } catch (error) {
    console.log('❌ 登录测试异常:', error.message);
    return null;
  }
}

// 测试用户列表
async function testUsers() {
  try {
    console.log('\n👥 测试获取用户列表...');
    const response = await axios.get(`${BASE_URL}/api/users`);
    
    if (response.status === 200) {
      console.log('✅ 用户列表获取成功');
      console.log('用户数量:', response.data.length);
      response.data.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}, 用户名: ${user.username}, 邮箱: ${user.email}`);
      });
    } else {
      console.log('❌ 用户列表获取失败');
    }
  } catch (error) {
    console.log('❌ 用户列表获取异常:', error.response?.data || error.message);
  }
}

// 主函数
async function main() {
  console.log('🚀 开始登录测试...\n');
  
  // 测试用户列表
  await testUsers();
  
  // 测试登录
  await testLogin();
  
  console.log('\n🎉 登录测试完成！');
}

main().catch(console.error); 