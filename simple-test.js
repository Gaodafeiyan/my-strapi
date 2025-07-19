const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function testServer() {
  try {
    console.log('🔍 检查服务器状态...');
    
    // 测试服务器是否运行
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ 服务器正常运行');
    console.log('响应:', response.data);
    
  } catch (error) {
    console.log('❌ 服务器连接失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 提示: 请确保Strapi服务器正在运行 (npm run strapi develop)');
    }
  }
}

testServer(); 