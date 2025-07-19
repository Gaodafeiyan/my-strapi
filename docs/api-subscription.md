# 认购系统 API 文档

## 概述
认购系统提供认购计划查询、订单创建、收益计算等功能。

## 基础信息
- **Base URL**: `http://localhost:1337/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

## 1. 认购计划

### 1.1 获取认购计划列表

#### 接口信息
- **URL**: `/subscription-plans`
- **Method**: `GET`
- **描述**: 获取所有可用的认购计划
- **认证**: 可选

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| filters[enabled] | boolean | 否 | 是否启用过滤 |
| sort | string | 否 | 排序字段，如 `priceUSDT:asc` |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "PLAN500",
        "priceUSDT": "500.00000000",
        "cycleDays": 15,
        "staticYieldPct": "6.00",
        "maxPurchaseCnt": 2,
        "aiTokenBonusPct": "3.00",
        "unlockAfterCnt": 2,
        "enabled": true,
        "referralPct": "100.00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    },
    {
      "id": 2,
      "attributes": {
        "name": "PLAN1K",
        "priceUSDT": "1000.00000000",
        "cycleDays": 20,
        "staticYieldPct": "7.00",
        "maxPurchaseCnt": 3,
        "aiTokenBonusPct": "4.00",
        "unlockAfterCnt": 3,
        "enabled": true,
        "referralPct": "90.00",
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
| name | string | 计划名称 |
| priceUSDT | string | 本金金额 |
| cycleDays | number | 周期天数 |
| staticYieldPct | string | 静态收益率 |
| maxPurchaseCnt | number | 最大购买次数 |
| aiTokenBonusPct | string | AI代币赠送比例 |
| unlockAfterCnt | number | 解锁条件（完成次数） |
| enabled | boolean | 是否启用 |
| referralPct | string | 返佣比例 |

#### 示例
```bash
# 获取所有计划
curl -X GET "http://localhost:1337/api/subscription-plans"

# 获取启用的计划
curl -X GET "http://localhost:1337/api/subscription-plans?filters[enabled]=true"

# 按价格排序
curl -X GET "http://localhost:1337/api/subscription-plans?sort=priceUSDT:asc"
```

### 1.2 获取单个认购计划

#### 接口信息
- **URL**: `/subscription-plans/:id`
- **Method**: `GET`
- **描述**: 获取单个认购计划详情
- **认证**: 可选

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "PLAN500",
      "priceUSDT": "500.00000000",
      "cycleDays": 15,
      "staticYieldPct": "6.00",
      "maxPurchaseCnt": 2,
      "aiTokenBonusPct": "3.00",
      "unlockAfterCnt": 2,
      "enabled": true,
      "referralPct": "100.00",
      "subscription_orders": {
        "data": []
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 2. 认购订单

### 2.1 创建认购订单

#### 接口信息
- **URL**: `/subscription-orders`
- **Method**: `POST`
- **描述**: 创建认购订单
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "planId": 1,
    "quantity": 1
  }
}
```

#### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| planId | number | 是 | 认购计划ID |
| quantity | number | 是 | 购买数量，默认1 |

#### 响应体
```json
{
  "orderId": 1,
  "walletTxId": 2,
  "message": "Subscription order created successfully"
}
```

#### 错误码
| 错误码 | 描述 |
|--------|------|
| 400 | 计划不存在或已禁用 |
| 400 | 余额不足 |
| 400 | 超过购买次数限制 |
| 400 | 解锁条件未满足 |
| 400 | 数量无效 |

#### 示例
```bash
curl -X POST "http://localhost:1337/api/subscription-orders" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "planId": 1,
      "quantity": 1
    }
  }'
```

### 2.2 获取认购订单列表

#### 接口信息
- **URL**: `/subscription-orders`
- **Method**: `GET`
- **描述**: 获取当前用户的认购订单
- **认证**: 需要Bearer Token

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| sort | string | 否 | 排序字段，如 `createdAt:desc` |
| pagination[page] | number | 否 | 页码，默认1 |
| pagination[pageSize] | number | 否 | 每页数量，默认25 |
| filters[orderState] | string | 否 | 订单状态过滤 |
| filters[plan] | number | 否 | 计划ID过滤 |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "quantity": 1,
        "principalUSDT": "500.00000000",
        "orderState": "active",
        "startAt": "2024-01-01T00:00:00.000Z",
        "endAt": "2024-01-16T00:00:00.000Z",
        "staticYieldUSDT": "30.00000000",
        "aiTokenQty": "15.00000000",
        "lotterySpinQuota": 3,
        "plan": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "PLAN500",
              "priceUSDT": "500.00000000",
              "cycleDays": 15,
              "staticYieldPct": "6.00"
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
| quantity | number | 购买数量 |
| principalUSDT | string | 本金金额 |
| orderState | string | 订单状态（active/finished） |
| startAt | string | 开始时间 |
| endAt | string | 结束时间 |
| staticYieldUSDT | string | 累计静态收益 |
| aiTokenQty | string | AI代币数量 |
| lotterySpinQuota | number | 抽奖次数配额 |

#### 示例
```bash
# 获取所有订单
curl -X GET "http://localhost:1337/api/subscription-orders" \
  -H "Authorization: Bearer <token>"

# 获取活跃订单
curl -X GET "http://localhost:1337/api/subscription-orders?filters[orderState]=active" \
  -H "Authorization: Bearer <token>"

# 分页查询
curl -X GET "http://localhost:1337/api/subscription-orders?pagination[page]=1&pagination[pageSize]=10" \
  -H "Authorization: Bearer <token>"
```

### 2.3 获取单个认购订单

#### 接口信息
- **URL**: `/subscription-orders/:id`
- **Method**: `GET`
- **描述**: 获取单个认购订单详情
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "quantity": 1,
      "principalUSDT": "500.00000000",
      "orderState": "active",
      "startAt": "2024-01-01T00:00:00.000Z",
      "endAt": "2024-01-16T00:00:00.000Z",
      "staticYieldUSDT": "30.00000000",
      "aiTokenQty": "15.00000000",
      "lotterySpinQuota": 3,
      "plan": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "PLAN500",
            "priceUSDT": "500.00000000",
            "cycleDays": 15,
            "staticYieldPct": "6.00",
            "aiTokenBonusPct": "3.00",
            "referralPct": "100.00"
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
}
```

## 3. 认购计划档位说明

### 档位配置表
| 档位ID | 本金USDT | 周期 | 静态收益% | AI代币% | 最大购买次数 | 解锁条件 | 返佣% |
|--------|----------|------|-----------|---------|--------------|----------|-------|
| PLAN500 | 500 | 15天 | 6% | 3% | 2次 | 2次赎回 | 100% |
| PLAN1K | 1000 | 20天 | 7% | 4% | 3次 | 3次赎回 | 90% |
| PLAN2K | 2000 | 25天 | 8% | 5% | 4次 | 4次赎回 | 80% |
| PLAN5K | 5000 | 30天 | 10% | 6% | 5次 | 无需解锁 | 70% |

### 解锁条件说明
- **PLAN500**: 默认解锁，无需条件
- **PLAN1K**: 需要完成2次PLAN500订单
- **PLAN2K**: 需要完成3次PLAN1K订单
- **PLAN5K**: 需要完成4次PLAN2K订单

### 收益计算
- **静态收益**: 本金 × 静态收益率 ÷ 周期天数
- **AI代币**: 本金 × AI代币比例
- **抽奖次数**: 每单获得3次抽奖机会

## 4. 业务逻辑

### 4.1 订单创建流程
1. 验证认购计划是否存在且启用
2. 检查用户余额是否充足
3. 验证购买次数限制
4. 检查解锁条件
5. 扣除用户余额
6. 创建认购订单
7. 创建钱包交易记录
8. 分配抽奖次数

### 4.2 静态收益计算
- **计算时间**: 每天00:05（北京时间）
- **计算公式**: 本金 × 静态收益率 ÷ 周期天数
- **更新内容**: 用户余额、订单累计收益
- **到期处理**: 订单完成时返还本金

### 4.3 AI代币解锁
- **解锁条件**: 同档位完成订单数 ≥ unlockAfterCnt
- **解锁内容**: 该档位所有未解锁AI代币
- **解锁时间**: 订单完成时触发

## 5. 错误处理

### 常见错误码
| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 计划不存在 | 检查计划ID是否正确 |
| 400 | 计划已禁用 | 选择其他可用计划 |
| 400 | 余额不足 | 先充值再认购 |
| 400 | 超过购买次数限制 | 等待解锁或选择其他计划 |
| 400 | 解锁条件未满足 | 先完成前置计划 |
| 400 | 数量无效 | 检查数量参数 |

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

## 6. 注意事项

1. **金额精度**: 所有金额字段使用8位小数精度
2. **时间格式**: 所有时间字段使用UTC时间戳
3. **状态同步**: 订单状态会实时更新
4. **收益计算**: 静态收益每日自动计算
5. **解锁机制**: 严格按照解锁条件执行
6. **抽奖次数**: 每单固定获得3次抽奖机会

## 7. 示例场景

### 场景1：用户首次认购
```bash
# 1. 用户注册
POST /api/auth/local/register

# 2. 用户充值
POST /api/wallet-balances

# 3. 查看认购计划
GET /api/subscription-plans

# 4. 创建认购订单
POST /api/subscription-orders
```

### 场景2：查看订单收益
```bash
# 1. 获取订单列表
GET /api/subscription-orders

# 2. 获取订单详情
GET /api/subscription-orders/1

# 3. 查看钱包余额
GET /api/wallet-balances
``` 