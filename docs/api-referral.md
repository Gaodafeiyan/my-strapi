# 邀请返佣系统 API 文档

## 概述
邀请返佣系统提供返佣记录查询、返佣统计等功能。

## 基础信息
- **Base URL**: `http://localhost:1337/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

## 1. 返佣记录

### 1.1 获取返佣记录列表

#### 接口信息
- **URL**: `/referral-rewards`
- **Method**: `GET`
- **描述**: 获取当前用户的返佣记录
- **认证**: 需要Bearer Token

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| sort | string | 否 | 排序字段，如 `createdAt:desc` |
| pagination[page] | number | 否 | 页码，默认1 |
| pagination[pageSize] | number | 否 | 每页数量，默认25 |
| filters[referrer] | number | 否 | 推荐人ID过滤 |
| filters[fromUser] | number | 否 | 被推荐人ID过滤 |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "amountUSDT": "30.00000000",
        "referrer": {
          "data": {
            "id": 2,
            "attributes": {
              "username": "referrer"
            }
          }
        },
        "fromUser": {
          "data": {
            "id": 1,
            "attributes": {
              "username": "user1"
            }
          }
        },
        "fromOrder": {
          "data": {
            "id": 1,
            "attributes": {
              "principalUSDT": "500.00000000",
              "staticYieldUSDT": "30.00000000"
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
| amountUSDT | string | 返佣金额 |
| referrer | object | 推荐人信息 |
| fromUser | object | 被推荐人信息 |
| fromOrder | object | 来源订单信息 |

#### 示例
```bash
# 获取所有返佣记录
curl -X GET "http://localhost:1337/api/referral-rewards" \
  -H "Authorization: Bearer <token>"

# 按时间排序
curl -X GET "http://localhost:1337/api/referral-rewards?sort=createdAt:desc" \
  -H "Authorization: Bearer <token>"

# 分页查询
curl -X GET "http://localhost:1337/api/referral-rewards?pagination[page]=1&pagination[pageSize]=10" \
  -H "Authorization: Bearer <token>"
```

### 1.2 获取单个返佣记录

#### 接口信息
- **URL**: `/referral-rewards/:id`
- **Method**: `GET`
- **描述**: 获取单个返佣记录详情
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "amountUSDT": "30.00000000",
      "referrer": {
        "data": {
          "id": 2,
          "attributes": {
            "username": "referrer",
            "email": "referrer@example.com"
          }
        }
      },
      "fromUser": {
        "data": {
          "id": 1,
          "attributes": {
            "username": "user1",
            "email": "user1@example.com"
          }
        }
      },
      "fromOrder": {
        "data": {
          "id": 1,
          "attributes": {
            "principalUSDT": "500.00000000",
            "staticYieldUSDT": "30.00000000",
            "plan": {
              "data": {
                "id": 1,
                "attributes": {
                  "name": "PLAN500",
                  "referralPct": "100.00"
                }
              }
            }
          }
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 2. 返佣统计

### 2.1 获取返佣统计信息

#### 接口信息
- **URL**: `/referral-rewards/statistics`
- **Method**: `GET`
- **描述**: 获取返佣统计信息
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "totalRewards": "150.00000000",
  "totalCount": 5,
  "todayRewards": "30.00000000",
  "todayCount": 1,
  "monthlyRewards": "120.00000000",
  "monthlyCount": 4,
  "referralUsers": 3,
  "activeReferrals": 2
}
```

#### 字段说明
| 字段 | 类型 | 描述 |
|------|------|------|
| totalRewards | string | 总返佣金额 |
| totalCount | number | 总返佣次数 |
| todayRewards | string | 今日返佣金额 |
| todayCount | number | 今日返佣次数 |
| monthlyRewards | string | 本月返佣金额 |
| monthlyCount | number | 本月返佣次数 |
| referralUsers | number | 推荐用户数 |
| activeReferrals | number | 活跃推荐数 |

## 3. 返佣规则说明

### 3.1 返佣触发条件
- **触发时机**: 被推荐人订单完成时
- **计算基础**: 被推荐人的静态收益
- **返佣比例**: 按档位百分比计算

### 3.2 档位返佣比例
| 档位 | 静态收益 | 返佣比例 | 返佣金额 |
|------|----------|----------|----------|
| PLAN500 | 30 USDT | 100% | 30 USDT |
| PLAN1K | 70 USDT | 90% | 63 USDT |
| PLAN2K | 160 USDT | 80% | 128 USDT |
| PLAN5K | 500 USDT | 70% | 350 USDT |

### 3.3 返佣计算示例

#### 示例1：PLAN500订单
```javascript
// 被推荐人认购PLAN500
const order = {
  principalUSDT: 500,
  staticYieldUSDT: 30,
  plan: { referralPct: 100 }
};

// 返佣计算
const referralAmount = order.staticYieldUSDT * (order.plan.referralPct / 100);
// 结果：30 * (100 / 100) = 30 USDT
```

#### 示例2：PLAN1K订单
```javascript
// 被推荐人认购PLAN1K
const order = {
  principalUSDT: 1000,
  staticYieldUSDT: 70,
  plan: { referralPct: 90 }
};

// 返佣计算
const referralAmount = order.staticYieldUSDT * (order.plan.referralPct / 100);
// 结果：70 * (90 / 100) = 63 USDT
```

## 4. 返佣流程

### 4.1 返佣触发流程
1. **订单完成**: 被推荐人订单状态变为finished
2. **计算返佣**: 静态收益 × 返佣比例
3. **创建记录**: 创建返佣记录
4. **更新余额**: 推荐人余额增加
5. **创建交易**: 创建钱包交易记录

### 4.2 返佣记录创建
```javascript
// 创建返佣记录
const referralReward = {
  referrer: referrerId,      // 推荐人ID
  fromUser: fromUserId,      // 被推荐人ID
  fromOrder: orderId,        // 来源订单ID
  amountUSDT: referralAmount // 返佣金额
};

// 创建钱包交易记录
const walletTx = {
  txType: 'referral',
  direction: 'in',
  amount: referralAmount,
  walletStatus: 'success',
  user: referrerId,
  asset: 1 // USDT
};
```

## 5. 用户关系查询

### 5.1 获取推荐人信息

#### 接口信息
- **URL**: `/users/me`
- **Method**: `GET`
- **描述**: 获取当前用户信息（包含推荐人）
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "id": 1,
  "username": "user1",
  "email": "user1@example.com",
  "diamondId": "D123456",
  "referralCode": "UID123456",
  "invitedBy": {
    "id": 2,
    "username": "referrer",
    "email": "referrer@example.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 5.2 获取推荐用户列表

#### 接口信息
- **URL**: `/users`
- **Method**: `GET`
- **描述**: 获取当前用户推荐的用户列表
- **认证**: 需要Bearer Token

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| filters[invitedBy] | number | 否 | 推荐人ID过滤 |

#### 响应体
```json
{
  "data": [
    {
      "id": 3,
      "attributes": {
        "username": "user2",
        "email": "user2@example.com",
        "diamondId": "D123457",
        "referralCode": "UID123457",
        "createdAt": "2024-01-01T00:00:00.000Z"
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

## 6. 返佣历史查询

### 6.1 按时间范围查询

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| filters[createdAt][$gte] | string | 否 | 开始时间 |
| filters[createdAt][$lte] | string | 否 | 结束时间 |

#### 示例
```bash
# 查询今日返佣
curl -X GET "http://localhost:1337/api/referral-rewards?filters[createdAt][$gte]=2024-01-01T00:00:00.000Z&filters[createdAt][$lte]=2024-01-01T23:59:59.999Z" \
  -H "Authorization: Bearer <token>"
```

### 6.2 按金额范围查询

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| filters[amountUSDT][$gte] | string | 否 | 最小金额 |
| filters[amountUSDT][$lte] | string | 否 | 最大金额 |

#### 示例
```bash
# 查询大额返佣（>= 50 USDT）
curl -X GET "http://localhost:1337/api/referral-rewards?filters[amountUSDT][$gte]=50.00000000" \
  -H "Authorization: Bearer <token>"
```

## 7. 错误处理

### 常见错误码
| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 401 | 未认证 | 检查Token是否有效 |
| 403 | 权限不足 | 检查用户权限 |
| 404 | 记录不存在 | 检查记录ID是否正确 |

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

## 8. 注意事项

1. **返佣时机**: 只有在订单完成时才触发返佣
2. **唯一一层**: 只支持直推返佣，不支持多层级
3. **金额精度**: 所有金额字段使用8位小数精度
4. **时间同步**: 返佣时间与订单完成时间一致
5. **自动处理**: 返佣完全自动化，无需手动操作

## 9. 示例场景

### 场景1：查看返佣记录
```bash
# 1. 获取返佣记录列表
GET /api/referral-rewards

# 2. 获取返佣统计
GET /api/referral-rewards/statistics

# 3. 查看推荐用户
GET /api/users?filters[invitedBy]=1
```

### 场景2：返佣流程演示
```bash
# 1. 推荐人注册
POST /api/auth/local/register

# 2. 被推荐人注册（使用推荐码）
POST /api/auth/local/register

# 3. 被推荐人认购
POST /api/subscription-orders

# 4. 订单完成后自动触发返佣
# 系统自动处理，无需手动操作
``` 