const axios = require('axios');

const BASE_URL = 'http://localhost:1337/api';

// 管理员Token（需要先登录获取）
let adminToken = '';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 登录获取Token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/local`, {
      identifier: 'admin',
      password: 'admin123'
    });
    adminToken = response.data.jwt;
    log('✅ 管理员登录成功', 'green');
    return adminToken;
  } catch (error) {
    log('❌ 管理员登录失败，请先创建管理员账户', 'red');
    throw error;
  }
}

// 创建Banner
async function createBanners() {
  log('\n📢 创建Banner数据...', 'blue');
  
  const banners = [
    {
      title: '欢迎来到淘金平台',
      subtitle: '安全可靠的数字资产投资平台',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
      link: '/subscription',
      enabled: true,
      sort: 1
    },
    {
      title: '认购计划火热进行中',
      subtitle: '多种档位，灵活选择，稳定收益',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      link: '/subscription',
      enabled: true,
      sort: 2
    },
    {
      title: '抽奖活动等你来',
      subtitle: '认购即可获得抽奖机会，大奖等你拿',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=400&fit=crop',
      link: '/lottery',
      enabled: true,
      sort: 3
    }
  ];

  for (const banner of banners) {
    try {
      await axios.post(`${BASE_URL}/banners`, {
        data: banner
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log(`✅ 创建Banner: ${banner.title}`, 'green');
    } catch (error) {
      log(`❌ 创建Banner失败: ${banner.title}`, 'red');
    }
  }
}

// 创建公告
async function createAnnouncements() {
  log('\n📢 创建公告数据...', 'blue');
  
  const announcements = [
    {
      title: '系统维护通知',
      content: '系统将于2024年1月15日凌晨2:00-4:00进行维护升级，期间可能影响部分功能使用，请提前做好准备。',
      type: 'maintenance',
      enabled: true,
      priority: 'high'
    }
  ];

  for (const announcement of announcements) {
    try {
      await axios.post(`${BASE_URL}/announcements`, {
        data: announcement
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log(`✅ 创建公告: ${announcement.title}`, 'green');
    } catch (error) {
      log(`❌ 创建公告失败: ${announcement.title}`, 'red');
    }
  }
}

// 创建商店商品
async function createStoreProducts() {
  log('\n🛍️ 创建商店商品...', 'blue');
  
  const products = [
    {
      name: 'iPhone 15 Pro',
      description: '最新款iPhone，搭载A17 Pro芯片，性能强劲，拍照出色',
      price: '999.00000000',
      originalPrice: '1099.00000000',
      stockQty: 50,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      enabled: true
    },
    {
      name: 'MacBook Pro 14"',
      description: '专业级笔记本电脑，M3芯片，适合开发者和设计师',
      price: '1999.00000000',
      originalPrice: '2199.00000000',
      stockQty: 20,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      enabled: true
    },
    {
      name: 'AirPods Pro',
      description: '主动降噪耳机，空间音频，完美音质体验',
      price: '249.00000000',
      originalPrice: '299.00000000',
      stockQty: 100,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop',
      enabled: true
    },
    {
      name: 'iPad Air',
      description: '轻薄便携的平板电脑，M2芯片，支持Apple Pencil',
      price: '599.00000000',
      originalPrice: '699.00000000',
      stockQty: 30,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
      enabled: true
    },
    {
      name: 'Apple Watch Series 9',
      description: '智能手表，健康监测，运动追踪',
      price: '399.00000000',
      originalPrice: '449.00000000',
      stockQty: 80,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
      enabled: true
    }
  ];

  for (const product of products) {
    try {
      await axios.post(`${BASE_URL}/store-products`, {
        data: product
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log(`✅ 创建商品: ${product.name}`, 'green');
    } catch (error) {
      log(`❌ 创建商品失败: ${product.name}`, 'red');
    }
  }
}

// 创建抽奖奖品
async function createLotteryPrizes() {
  log('\n🎰 创建抽奖奖品...', 'blue');
  
  const prizes = [
    {
      name: '一等奖 - 1000 USDT',
      description: '恭喜获得1000 USDT大奖！',
      prizeType: 'usdt',
      amount: '1000.00000000',
      probabilityWeight: 1,
      stockQty: 10,
      enabled: true
    },
    {
      name: '二等奖 - 500 USDT',
      description: '恭喜获得500 USDT！',
      prizeType: 'usdt',
      amount: '500.00000000',
      probabilityWeight: 5,
      stockQty: 50,
      enabled: true
    },
    {
      name: '三等奖 - 200 USDT',
      description: '恭喜获得200 USDT！',
      prizeType: 'usdt',
      amount: '200.00000000',
      probabilityWeight: 20,
      stockQty: 100,
      enabled: true
    },
    {
      name: '四等奖 - 100 USDT',
      description: '恭喜获得100 USDT！',
      prizeType: 'usdt',
      amount: '100.00000000',
      probabilityWeight: 50,
      stockQty: 200,
      enabled: true
    },
    {
      name: '五等奖 - 50 USDT',
      description: '恭喜获得50 USDT！',
      prizeType: 'usdt',
      amount: '50.00000000',
      probabilityWeight: 100,
      stockQty: 500,
      enabled: true
    },
    {
      name: 'AI代币奖励 - 100 AI',
      description: '恭喜获得100 AI代币！',
      prizeType: 'ai_token',
      amount: '100.00000000',
      probabilityWeight: 30,
      stockQty: -1,
      enabled: true
    },
    {
      name: '谢谢参与',
      description: '很遗憾，下次再来！',
      prizeType: 'usdt',
      amount: '0.00000000',
      probabilityWeight: 200,
      stockQty: -1,
      enabled: true
    }
  ];

  for (const prize of prizes) {
    try {
      await axios.post(`${BASE_URL}/lottery-prizes`, {
        data: prize
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log(`✅ 创建奖品: ${prize.name}`, 'green');
    } catch (error) {
      log(`❌ 创建奖品失败: ${prize.name}`, 'red');
    }
  }
}

// 创建测试用户
async function createTestUsers() {
  log('\n👥 创建测试用户...', 'blue');
  
  const testUsers = [
    {
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: '123456',
      inviteCode: 'admin'
    },
    {
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: '123456',
      inviteCode: 'testuser1'
    },
    {
      username: 'testuser3',
      email: 'testuser3@example.com',
      password: '123456',
      inviteCode: 'testuser1'
    }
  ];

  for (const user of testUsers) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/local/register`, user);
      log(`✅ 创建用户: ${user.username}`, 'green');
      
      // 为用户充值一些余额用于测试
      const userId = response.data.user.id;
      await axios.post(`${BASE_URL}/wallet-balances`, {
        data: {
          amount: '5000.00000000'
        }
      }, {
        headers: { Authorization: `Bearer ${response.data.jwt}` }
      });
      log(`✅ 为用户 ${user.username} 充值 5000 USDT`, 'green');
      
    } catch (error) {
      log(`❌ 创建用户失败: ${user.username}`, 'red');
    }
  }
}

// 创建代币价格
async function createTokenPrices() {
  log('\n💰 创建代币价格...', 'blue');
  
  const tokenPrices = [
    {
      symbol: 'USDT',
      price: '1.00000000',
      change24h: '0.00',
      enabled: true
    },
    {
      symbol: 'AI',
      price: '0.50000000',
      change24h: '5.20',
      enabled: true
    }
  ];

  for (const tokenPrice of tokenPrices) {
    try {
      await axios.post(`${BASE_URL}/token-prices`, {
        data: tokenPrice
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      log(`✅ 创建代币价格: ${tokenPrice.symbol}`, 'green');
    } catch (error) {
      log(`❌ 创建代币价格失败: ${tokenPrice.symbol}`, 'red');
    }
  }
}

// 主函数
async function main() {
  log('🚀 开始创建前端UAT测试数据...', 'yellow');
  
  try {
    // 1. 登录获取Token
    await login();
    
    // 2. 创建Banner
    await createBanners();
    
    // 3. 创建公告
    await createAnnouncements();
    
    // 4. 创建商店商品
    await createStoreProducts();
    
    // 5. 创建抽奖奖品
    await createLotteryPrizes();
    
    // 6. 创建测试用户
    await createTestUsers();
    
    // 7. 创建代币价格
    await createTokenPrices();
    
    log('\n🎉 前端UAT测试数据创建完成！', 'green');
    log('\n📋 创建的数据包括：', 'blue');
    log('   • 3个Banner', 'green');
    log('   • 1个公告', 'green');
    log('   • 5个商店商品', 'green');
    log('   • 7个抽奖奖品', 'green');
    log('   • 3个测试用户（每个用户充值5000 USDT）', 'green');
    log('   • 2个代币价格', 'green');
    
    log('\n🔗 测试链接：', 'blue');
    log('   • 首页: http://localhost:3000', 'green');
    log('   • 认购页面: http://localhost:3000/subscription', 'green');
    log('   • 抽奖页面: http://localhost:3000/lottery', 'green');
    log('   • 商店页面: http://localhost:3000/shop', 'green');
    log('   • 钱包页面: http://localhost:3000/wallet', 'green');
    
    log('\n👤 测试用户账号：', 'blue');
    log('   • testuser1 / 123456', 'green');
    log('   • testuser2 / 123456', 'green');
    log('   • testuser3 / 123456', 'green');
    
  } catch (error) {
    log('❌ 创建测试数据失败', 'red');
    console.error(error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  createBanners,
  createAnnouncements,
  createStoreProducts,
  createLotteryPrizes,
  createTestUsers,
  createTokenPrices
}; 