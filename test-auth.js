const axios = require('axios');

async function testAuth() {
  try {
    // 1. 注册用户
    console.log('1. 注册用户...');
    const registerResponse = await axios.post('http://118.107.4.158:1337/api/auth/local/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    console.log('注册成功:', registerResponse.data);

    // 2. 登录获取token
    console.log('\n2. 登录获取token...');
    const loginResponse = await axios.post('http://118.107.4.158:1337/api/auth/local', {
      identifier: 'testuser',
      password: 'testpassword123'
    });
    console.log('登录成功:', loginResponse.data);

    const token = loginResponse.data.jwt;

    // 3. 测试API
    console.log('\n3. 测试API...');
    
    // 测试余额查询
    const balanceResponse = await axios.get('http://118.107.4.158:1337/api/wallet-balances', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('余额查询成功:', balanceResponse.data);

    // 测试充值地址
    const addressResponse = await axios.get('http://118.107.4.158:1337/api/wallet-balances/deposit-address', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('充值地址查询成功:', addressResponse.data);

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testAuth(); 