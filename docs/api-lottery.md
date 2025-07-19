# 抽奖系统 API 文档

## 概述
抽奖系统提供抽奖配置、奖品管理、抽奖记录等功能。

## 基础信息
- **Base URL**: `http://localhost:1337/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

## 1. 抽奖配置

### 1.1 获取抽奖配置

#### 接口信息
- **URL**: `/lottery-configs`
- **Method**: `GET`
- **描述**: 获取抽奖配置信息
- **认证**: 可选

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "淘金转盘",
        "spinCostUSDT": "0.00000000",
        "enabled": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### 字段说明
| 字段 | 类型 | 描述 |
|------|------|------|
| name | string | 抽奖活动名称 |
| spinCostUSDT | string | 每次抽奖费用（0表示免费） |
| enabled | boolean | 是否启用 |

### 1.2 创建抽奖配置

#### 接口信息
- **URL**: `/lottery-configs`
- **Method**: `POST`
- **描述**: 创建抽奖配置（管理员功能）
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "name": "淘金转盘",
    "spinCostUSDT": "0.00000000",
    "enabled": true
  }
}
```

## 2. 抽奖奖品

### 2.1 获取奖品列表

#### 接口信息
- **URL**: `/lottery-prizes`
- **Method**: `GET`
- **描述**: 获取所有抽奖奖品
- **认证**: 可选

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| filters[enabled] | boolean | 否 | 是否启用过滤 |
| sort | string | 否 | 排序字段，如 `probabilityWeight:desc` |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "一等奖 - 1000 USDT",
        "description": "恭喜获得1000 USDT大奖！",
        "prizeType": "usdt",
        "amount": "1000.00000000",
        "probabilityWeight": 1,
        "stockQty": 10,
        "enabled": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    },
    {
      "id": 2,
      "attributes": {
        "name": "二等奖 - 500 USDT",
        "description": "恭喜获得500 USDT！",
        "prizeType": "usdt",
        "amount": "500.00000000",
        "probabilityWeight": 5,
        "stockQty": 50,
        "enabled": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
}
```

#### 字段说明
| 字段 | 类型 | 描述 |
|------|------|------|
| name | string | 奖品名称 |
| description | string | 奖品描述 |
| prizeType | string | 奖品类型（usdt/ai_token/physical） |
| amount | string | 奖品金额 |
| probabilityWeight | number | 概率权重 |
| stockQty | number | 库存数量（-1表示无限） |
| enabled | boolean | 是否启用 |

#### 奖品类型说明
| prizeType | 描述 |
|-----------|------|
| usdt | USDT奖励 |
| ai_token | AI代币奖励 |
| physical | 实物奖品 |

#### 示例
```bash
# 获取所有奖品
curl -X GET "http://localhost:1337/api/lottery-prizes"

# 获取启用的奖品
curl -X GET "http://localhost:1337/api/lottery-prizes?filters[enabled]=true"

# 按权重排序
curl -X GET "http://localhost:1337/api/lottery-prizes?sort=probabilityWeight:desc"
```

### 2.2 获取单个奖品

#### 接口信息
- **URL**: `/lottery-prizes/:id`
- **Method**: `GET`
- **描述**: 获取单个奖品详情
- **认证**: 可选

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "一等奖 - 1000 USDT",
      "description": "恭喜获得1000 USDT大奖！",
      "prizeType": "usdt",
      "amount": "1000.00000000",
      "probabilityWeight": 1,
      "stockQty": 10,
      "enabled": true,
      "lottery_spins": {
        "data": []
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2.3 创建奖品

#### 接口信息
- **URL**: `/lottery-prizes`
- **Method**: `POST`
- **描述**: 创建抽奖奖品（管理员功能）
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "name": "一等奖 - 1000 USDT",
    "description": "恭喜获得1000 USDT大奖！",
    "prizeType": "usdt",
    "amount": "1000.00000000",
    "probabilityWeight": 1,
    "stockQty": 10,
    "enabled": true
  }
}
```

#### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| name | string | 是 | 奖品名称 |
| description | string | 否 | 奖品描述 |
| prizeType | string | 是 | 奖品类型 |
| amount | string | 是 | 奖品金额 |
| probabilityWeight | number | 是 | 概率权重 |
| stockQty | number | 否 | 库存数量，默认-1 |
| enabled | boolean | 否 | 是否启用，默认true |

## 3. 抽奖功能

### 3.1 执行抽奖

#### 接口信息
- **URL**: `/lottery/spin`
- **Method**: `POST`
- **描述**: 执行抽奖
- **认证**: 需要Bearer Token

#### 请求体
```json
{}
```

#### 响应体
```json
{
  "success": true,
  "prize": {
    "id": 1,
    "attributes": {
      "name": "一等奖 - 1000 USDT",
      "description": "恭喜获得1000 USDT大奖！",
      "prizeType": "usdt",
      "amount": "1000.00000000",
      "probabilityWeight": 1,
      "stockQty": 9,
      "enabled": true
    }
  },
  "spinCost": "0.00000000",
  "remainingQuota": 2
}
```

#### 字段说明
| 字段 | 类型 | 描述 |
|------|------|------|
| success | boolean | 抽奖是否成功 |
| prize | object | 中奖奖品信息 |
| spinCost | string | 本次抽奖费用 |
| remainingQuota | number | 剩余抽奖次数 |

#### 错误码
| 错误码 | 描述 |
|--------|------|
| 400 | 抽奖次数不足 |
| 400 | 余额不足（付费抽奖） |
| 400 | 抽奖未配置 |
| 400 | 奖品库存不足 |

#### 示例
```bash
curl -X POST "http://localhost:1337/api/lottery/spin" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## 4. 抽奖记录

### 4.1 获取抽奖记录

#### 接口信息
- **URL**: `/lottery-spins`
- **Method**: `GET`
- **描述**: 获取当前用户的抽奖记录
- **认证**: 需要Bearer Token

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| sort | string | 否 | 排序字段，如 `createdAt:desc` |
| pagination[page] | number | 否 | 页码，默认1 |
| pagination[pageSize] | number | 否 | 每页数量，默认25 |
| filters[prize] | number | 否 | 奖品ID过滤 |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "spinCostUSDT": "0.00000000",
        "result": {
          "prizeName": "一等奖 - 1000 USDT",
          "prizeType": "usdt",
          "amount": "1000.00000000"
        },
        "prize": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "一等奖 - 1000 USDT",
              "prizeType": "usdt",
              "amount": "1000.00000000"
            }
          }
        },
        "user": {
          "data": {
            "id": 1,
            "attributes": {
              "username": "testuser"
            }
          }
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### 字段说明
| 字段 | 类型 | 描述 |
|------|------|------|
| spinCostUSDT | string | 抽奖费用 |
| result | object | 抽奖结果详情 |
| prize | object | 中奖奖品信息 |
| user | object | 用户信息 |

#### 示例
```bash
# 获取所有抽奖记录
curl -X GET "http://localhost:1337/api/lottery-spins" \
  -H "Authorization: Bearer <token>"

# 按时间排序
curl -X GET "http://localhost:1337/api/lottery-spins?sort=createdAt:desc" \
  -H "Authorization: Bearer <token>"

# 分页查询
curl -X GET "http://localhost:1337/api/lottery-spins?pagination[page]=1&pagination[pageSize]=10" \
  -H "Authorization: Bearer <token>"
```

### 4.2 获取单个抽奖记录

#### 接口信息
- **URL**: `/lottery-spins/:id`
- **Method**: `GET`
- **描述**: 获取单个抽奖记录详情
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "spinCostUSDT": "0.00000000",
      "result": {
        "prizeName": "一等奖 - 1000 USDT",
        "prizeType": "usdt",
        "amount": "1000.00000000"
      },
      "prize": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "一等奖 - 1000 USDT",
            "description": "恭喜获得1000 USDT大奖！",
            "prizeType": "usdt",
            "amount": "1000.00000000",
            "probabilityWeight": 1,
            "stockQty": 9,
            "enabled": true
          }
        }
      },
      "user": {
        "data": {
          "id": 1,
          "attributes": {
            "username": "testuser",
            "email": "testuser@example.com"
          }
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 5. 抽奖次数管理

### 5.1 获取抽奖次数配额

#### 接口信息
- **URL**: `/subscription-orders`
- **Method**: `GET`
- **描述**: 通过认购订单获取抽奖次数配额
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "lotterySpinQuota": 3,
        "orderState": "active",
        "plan": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "PLAN500"
            }
          }
        }
      }
    }
  ]
}
```

### 5.2 计算剩余抽奖次数

#### 计算逻辑
```javascript
// 1. 获取所有活跃订单的抽奖配额
const activeOrders = await getActiveOrders(userId);
let totalQuota = 0;
for (const order of activeOrders) {
  totalQuota += order.lotterySpinQuota || 0;
}

// 2. 获取已使用的抽奖次数
const usedSpins = await getUsedSpins(userId);

// 3. 计算剩余次数
const remainingQuota = totalQuota - usedSpins;
```

## 6. 抽奖概率计算

### 6.1 权重随机算法

#### 算法说明
```javascript
// 1. 获取所有启用的奖品
const prizes = await getEnabledPrizes();

// 2. 计算总权重
const totalWeight = prizes.reduce((sum, prize) => sum + prize.probabilityWeight, 0);

// 3. 随机选择奖品
const random = Math.random() * totalWeight;
let currentWeight = 0;
let selectedPrize = null;

for (const prize of prizes) {
  currentWeight += prize.probabilityWeight;
  if (random <= currentWeight) {
    selectedPrize = prize;
    break;
  }
}

// 4. 保底选择
if (!selectedPrize) {
  selectedPrize = prizes[prizes.length - 1];
}
```

### 6.2 概率计算示例

#### 奖品配置
| 奖品 | 权重 | 概率 |
|------|------|------|
| 一等奖 | 1 | 0.3% |
| 二等奖 | 5 | 1.5% |
| 三等奖 | 20 | 6.0% |
| 四等奖 | 50 | 15.0% |
| 五等奖 | 100 | 30.0% |
| AI代币 | 30 | 9.0% |
| 谢谢参与 | 200 | 60.0% |
| **总计** | **406** | **100%** |

## 7. 奖品发放机制

### 7.1 USDT奖励发放
```javascript
// 1. 更新用户余额
await updateWalletBalance(userId, prize.amount);

// 2. 创建钱包交易记录
await createWalletTx({
  txType: 'lottery_prize',
  direction: 'in',
  amount: prize.amount,
  walletStatus: 'success',
  user: userId,
  asset: 1 // USDT
});
```

### 7.2 AI代币奖励发放
```javascript
// 1. 更新AI代币余额
await updateAiTokenBalance(userId, prize.amount);

// 2. 创建代币交易记录
await createTokenTx({
  txType: 'lottery_ai_token',
  direction: 'in',
  amount: prize.amount,
  user: userId,
  asset: 2 // AI Token
});
```

### 7.3 实物奖品处理
```javascript
// 1. 创建实物奖品订单
await createPhysicalPrizeOrder({
  userId: userId,
  prizeId: prize.id,
  status: 'pending'
});

// 2. 发送通知给管理员
await sendAdminNotification({
  type: 'physical_prize',
  userId: userId,
  prizeName: prize.name
});
```

## 8. 库存管理

### 8.1 库存检查
```javascript
// 检查库存
if (prize.stockQty !== -1 && prize.stockQty <= 0) {
  throw new Error('PRIZE_OUT_OF_STOCK');
}
```

### 8.2 库存扣减
```javascript
// 减少库存
if (prize.stockQty !== -1) {
  await updatePrizeStock(prize.id, prize.stockQty - 1);
}
```

## 9. 错误处理

### 常见错误码
| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 抽奖次数不足 | 先认购获得抽奖次数 |
| 400 | 余额不足 | 充值后再抽奖 |
| 400 | 抽奖未配置 | 联系管理员配置 |
| 400 | 奖品库存不足 | 等待补货或选择其他奖品 |
| 401 | 未认证 | 检查Token是否有效 |

### 错误响应格式
```json
{
  "error": {
    "status": 400,
    "name": "BadRequest",
    "message": "错误描述",
    "details": {}
  }
}
```

## 10. 注意事项

1. **抽奖次数**: 每认购订单获得3次抽奖机会
2. **费用设置**: 可配置免费或付费抽奖
3. **概率控制**: 通过权重控制中奖概率
4. **库存管理**: 支持有限库存和无限库存
5. **奖品类型**: 支持USDT、AI代币、实物奖品
6. **自动发放**: 中奖后自动发放到用户账户

## 11. 示例场景

### 场景1：用户抽奖流程
```bash
# 1. 查看抽奖配置
GET /api/lottery-configs

# 2. 查看奖品列表
GET /api/lottery-prizes

# 3. 执行抽奖
POST /api/lottery/spin

# 4. 查看抽奖记录
GET /api/lottery-spins
```

### 场景2：管理员配置奖品
```bash
# 1. 创建奖品
POST /api/lottery-prizes

# 2. 更新奖品权重
PUT /api/lottery-prizes/1

# 3. 查看抽奖统计
GET /api/lottery-spins?filters[prize]=1
``` 