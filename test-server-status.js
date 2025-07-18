const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

async function checkServerStatus() {
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

    // 2. 检查API版本信息
    console.log('2️⃣ 检查API版本...');
    try {
      const versionResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ API版本信息:', versionResponse.data);
    } catch (error) {
      console.log('❌ 版本检查失败:', error.message);
    }

    // 3. 尝试用户注册（测试是否已更新）
    console.log('3️⃣ 测试用户注册（检查是否已更新代码）...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/invite-register`, {
        username: 'testupdate',
        email: 'testupdate@example.com',
        password: '123456',
        inviteCode: 'user'
      });
      console.log('✅ 注册成功 - 代码已更新:', registerResponse.data);
    } catch (error) {
      if (error.response?.data?.error?.message === 'DEPOSIT_ADDR_MNEMONIC not configured') {
        console.log('❌ 注册失败 - 代码未更新，还在使用旧版本');
      } else {
        console.log('❌ 注册失败:', error.response?.data);
      }
    }

    // 4. 检查自定义提现API
    console.log('4️⃣ 检查自定义提现API...');
    try {
      const withdrawResponse = await axios.post(`${BASE_URL}/api/wallet/withdraw`, {
        toAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amountUSDT: 10.5
      });
      console.log('✅ 自定义提现API正常');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ 自定义提现API不存在 - 代码未更新');
      } else {
        console.log('❌ 自定义提现API错误:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.log('❌ 检查失败:', error.message);
  }
}

checkServerStatus(); 