const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function checkRemoteServer() {
  console.log('🔍 检查远程服务器状态...');
  
  try {
    // 1. 检查服务器健康状态
    console.log('1️⃣ 检查服务器健康状态...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ 服务器健康:', healthResponse.data);
    } catch (error) {
      console.log('❌ 健康检查失败:', error.message);
    }

    // 2. 检查邀请码
    console.log('2️⃣ 检查邀请码...');
    try {
      const inviteResponse = await axios.get(`${BASE_URL}/api/invite-codes`);
      console.log('✅ 邀请码列表:', inviteResponse.data);
    } catch (error) {
      console.log('❌ 邀请码查询失败:', error.message);
    }

    // 3. 尝试直接创建用户（管理员操作）
    console.log('3️⃣ 尝试直接创建用户...');
    try {
      const createUserResponse = await axios.post(`${BASE_URL}/api/users-permissions/users`, {
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: '123456',
        confirmed: true,
        blocked: false,
        role: 1 // Authenticated role
      });
      console.log('✅ 用户创建成功:', createUserResponse.data);
    } catch (error) {
      console.log('❌ 用户创建失败:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // 4. 尝试登录现有用户
    console.log('4️⃣ 尝试登录现有用户...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/local`, {
        identifier: 'admin@strapi.io',
        password: 'strapi123'
      });
      if (loginResponse.data.jwt) {
        console.log('✅ 管理员登录成功');
      }
    } catch (error) {
      console.log('❌ 管理员登录失败:', error.message);
    }
    
  } catch (error) {
    console.log('❌ 检查失败:', error.message);
  }
}

checkRemoteServer(); 