# API 文档总览

## 📚 文档结构

### 1. API 对接手册
- [认证系统 API 文档](./api-auth.md) - 用户注册、登录、JWT管理
- [钱包系统 API 文档](./api-wallet.md) - 余额查询、交易记录、充值提现
- [认购系统 API 文档](./api-subscription.md) - 认购计划、订单管理、收益计算
- [邀请返佣系统 API 文档](./api-referral.md) - 返佣记录、统计查询
- [抽奖系统 API 文档](./api-lottery.md) - 抽奖配置、奖品管理、抽奖记录
- [商店系统 API 文档](./api-shop.md) - 商品管理、订单创建、库存管理

### 2. 技术规范
- [OpenAPI 规范](./openapi.yaml) - 完整的API规范文档，支持Swagger UI

## 🚀 快速开始

### 1. 环境准备
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run develop
```

### 2. 创建测试数据
```bash
# 创建认购计划
node scripts/seed-subscription-plans.js

# 创建抽奖系统
node scripts/seed-lottery.js

# 创建前端UAT测试数据
node scripts/seed-frontend-uat.js
```

### 3. 运行测试
```bash
# 完整系统测试
node test-complete-system.js

# 新制度测试
node test-new-system.js
```

## 📋 API 端点总览

### 认证系统 (Auth)
| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/auth/local/register` | 用户注册 |
| POST | `/auth/local` | 用户登录 |
| GET | `/users/me` | 获取当前用户信息 |
| POST | `/auth/refresh` | 刷新Token |
| POST | `/auth/logout` | 用户登出 |

### 钱包系统 (Wallet)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/wallet-balances` | 获取钱包余额 |
| POST | `/wallet-balances` | 创建/更新钱包余额 |
| GET | `/wallet-txes` | 获取交易记录 |
| POST | `/wallet-txes` | 创建交易记录 |
| GET | `/deposit-addresses` | 获取充值地址 |
| POST | `/deposit-addresses` | 创建充值地址 |
| POST | `/withdraw-requests` | 创建提现请求 |
| GET | `/withdraw-requests` | 获取提现记录 |
| POST | `/wallet/withdraw` | 自定义提现接口 |

### 认购系统 (Subscription)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/subscription-plans` | 获取认购计划列表 |
| GET | `/subscription-plans/:id` | 获取单个认购计划 |
| POST | `/subscription-orders` | 创建认购订单 |
| GET | `/subscription-orders` | 获取认购订单列表 |
| GET | `/subscription-orders/:id` | 获取单个认购订单 |

### 邀请返佣系统 (Referral)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/referral-rewards` | 获取返佣记录列表 |
| GET | `/referral-rewards/:id` | 获取单个返佣记录 |
| GET | `/referral-rewards/statistics` | 获取返佣统计信息 |

### 抽奖系统 (Lottery)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/lottery-configs` | 获取抽奖配置 |
| POST | `/lottery-configs` | 创建抽奖配置 |
| GET | `/lottery-prizes` | 获取奖品列表 |
| GET | `/lottery-prizes/:id` | 获取单个奖品 |
| POST | `/lottery-prizes` | 创建奖品 |
| POST | `/lottery/spin` | 执行抽奖 |
| GET | `/lottery-spins` | 获取抽奖记录 |
| GET | `/lottery-spins/:id` | 获取单个抽奖记录 |

### 商店系统 (Shop)
| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/store-products` | 获取商品列表 |
| GET | `/store-products/:id` | 获取单个商品 |
| POST | `/store-products` | 创建商品 |
| POST | `/shop-orders` | 创建商店订单 |
| GET | `/shop-orders` | 获取商店订单列表 |
| GET | `/shop-orders/:id` | 获取单个商店订单 |

## 🔧 开发工具

### 1. 种子脚本
- `scripts/seed-subscription-plans.js` - 创建认购计划数据
- `scripts/seed-lottery.js` - 创建抽奖系统数据
- `scripts/seed-frontend-uat.js` - 创建前端UAT测试数据

### 2. 测试脚本
- `test-complete-system.js` - 完整系统测试
- `test-new-system.js` - 新制度测试
- `test-subscription.js` - 认购系统测试
- `test-wallet.js` - 钱包功能测试
- `test-withdraw.js` - 提现功能测试
- `test-api-endpoints.js` - API接口测试

## 📊 数据模型

### 核心实体
- **User** - 用户表（扩展邀请关系）
- **WalletBalance** - 钱包余额
- **WalletTx** - 钱包交易记录
- **DepositAddress** - 充值地址
- **SubscriptionPlan** - 认购计划
- **SubscriptionOrder** - 认购订单
- **ReferralReward** - 返佣记录
- **WithdrawRequest** - 提现请求
- **LotteryConfig** - 抽奖配置
- **LotteryPrize** - 抽奖奖品
- **LotterySpin** - 抽奖记录
- **StoreProduct** - 商店商品
- **ShopOrder** - 商店订单

### 认购计划档位
| 档位ID | 本金USDT | 周期 | 静态收益% | AI代币% | 最大购买次数 | 解锁条件 | 返佣% |
|--------|----------|------|-----------|---------|--------------|----------|-------|
| PLAN500 | 500 | 15天 | 6% | 3% | 2次 | 2次赎回 | 100% |
| PLAN1K | 1000 | 20天 | 7% | 4% | 3次 | 3次赎回 | 90% |
| PLAN2K | 2000 | 25天 | 8% | 5% | 4次 | 4次赎回 | 80% |
| PLAN5K | 5000 | 30天 | 10% | 6% | 5次 | 无需解锁 | 70% |

## 🔄 业务流程

### 1. 用户注册流程
1. 用户提供邀请码注册
2. 系统验证邀请码有效性
3. 创建用户账户和充值地址
4. 建立邀请关系
5. 初始化钱包余额

### 2. 认购流程
1. 用户选择认购计划
2. 系统验证解锁条件
3. 检查购买次数限制
4. 扣除用户余额
5. 创建认购订单
6. 分配抽奖次数
7. 计算AI代币

### 3. 返佣流程
1. 被推荐人订单完成
2. 计算返佣金额（静态收益 × 返佣比例）
3. 更新推荐人余额
4. 创建返佣记录
5. 创建钱包交易记录

### 4. 抽奖流程
1. 检查用户抽奖次数配额
2. 权重随机选择奖品
3. 检查奖品库存
4. 发放奖品到用户账户
5. 创建抽奖记录

## ⚙️ 系统配置

### 时区设置
- 系统时区：`Asia/Shanghai`
- 所有时间字段使用UTC时间戳
- 定时任务按北京时间执行

### 自动化任务
- **每15秒**：区块链充值监听
- **每30秒**：提现处理
- **每小时**：补偿扫描
- **每5分钟**：统计报告
- **每天00:05**：静态收益计算

### 安全配置
- JWT认证
- 角色权限控制
- 输入验证
- 错误处理
- 日志记录

## 🧪 测试指南

### 1. 单元测试
```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "subscription"
```

### 2. API测试
```bash
# 运行API测试
node test-api-endpoints.js

# 运行完整系统测试
node test-complete-system.js
```

### 3. 性能测试
```bash
# 使用Artillery进行负载测试
npm install -g artillery
artillery run tests/load-test.yml
```

## 📝 开发规范

### 1. 代码风格
- 使用TypeScript
- 遵循ESLint规则
- 使用Prettier格式化
- 添加JSDoc注释

### 2. Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

### 3. API设计原则
- RESTful设计
- 统一响应格式
- 错误码标准化
- 版本控制
- 文档同步

## 🔗 相关链接

- [Strapi官方文档](https://docs.strapi.io/)
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [OpenAPI规范](https://swagger.io/specification/)

## 📞 技术支持

如有问题，请联系：
- 邮箱：support@example.com
- 文档：https://docs.example.com
- 社区：https://community.example.com 