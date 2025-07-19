const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';

// 测试用例
const testCases = [
  {
    name: '完整参数注册',
    data: {
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'testpass123',
      inviteCode: 'user'
    },
    expectedStatus: 200
  },
  {
    name: '缺少username',
    data: {
      email: 'test2@example.com',
      password: 'testpass123',
      inviteCode: 'user'
    },
    expectedStatus: 400
  },
  {
    name: '缺少email',
    data: {
      username: 'testuser3',
      password: 'testpass123',
      inviteCode: 'user'
    },
    expectedStatus: 400
  },
  {
    name: '缺少password',
    data: {
      username: 'testuser4',
      email: 'test4@example.com',
      inviteCode: 'user'
    },
    expectedStatus: 400
  },
  {
    name: '缺少inviteCode',
    data: {
      username: 'testuser5',
      email: 'test5@example.com',
      password: 'testpass123'
    },
    expectedStatus: 400
  },
  {
    name: '无效邀请码',
    data: {
      username: 'testuser6',
      email: 'test6@example.com',
      password: 'testpass123',
      inviteCode: 'invalidcode'
    },
    expectedStatus: 400
  },
  {
    name: '用户名太短',
    data: {
      username: 'ab',
      email: 'test7@example.com',
      password: 'testpass123',
      inviteCode: 'user'
    },
    expectedStatus: 400
  },
  {
    name: '邮箱格式错误',
    data: {
      username: 'testuser8',
      email: 'invalid-email',
      password: 'testpass123',
      inviteCode: 'user'
    },
    expectedStatus: 400
  },
  {
    name: '密码太短',
    data: {
      username: 'testuser9',
      email: 'test9@example.com',
      password: '123',
      inviteCode: 'user'
    },
    expectedStatus: 400
  }
];

async function runTest(testCase) {
  try {
    console.log(`🧪 测试: ${testCase.name}`);
    console.log(`   请求数据: ${JSON.stringify(testCase.data)}`);
    
    const response = await axios.post(`${BASE_URL}/api/wallet/auth/invite-register`, testCase.data);
    
    if (response.status === testCase.expectedStatus) {
      console.log(`✅ ${testCase.name} - 通过 (状态码: ${response.status})`);
      if (response.status === 200) {
        console.log(`   注册成功: ${response.data.user?.username}`);
      }
    } else {
      console.log(`❌ ${testCase.name} - 失败 (期望: ${testCase.expectedStatus}, 实际: ${response.status})`);
    }
  } catch (error) {
    if (error.response?.status === testCase.expectedStatus) {
      console.log(`✅ ${testCase.name} - 通过 (状态码: ${error.response.status})`);
      if (error.response.data?.error) {
        console.log(`   错误信息: ${error.response.data.error.message}`);
      }
    } else {
      console.log(`❌ ${testCase.name} - 失败 (期望: ${testCase.expectedStatus}, 实际: ${error.response?.status || '网络错误'})`);
      if (error.response?.data) {
        console.log(`   错误详情: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
  console.log('');
}

async function runAllTests() {
  console.log('🚀 开始注册接口参数验证测试...');
  console.log(`📍 测试目标: ${BASE_URL}/api/wallet/auth/invite-register`);
  console.log('');
  
  for (const testCase of testCases) {
    await runTest(testCase);
  }
  
  console.log('📊 测试完成');
}

runAllTests().catch(error => {
  console.error('💥 测试执行失败:', error.message);
  process.exit(1);
}); 