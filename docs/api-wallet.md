# 钱包系统 API 文档

## 概述
钱包系统提供余额查询、交易记录、充值地址管理等功能。

## 基础信息
- **Base URL**: `http://localhost:1337/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

## 1. 钱包余额

### 1.1 获取钱包余额

#### 接口信息
- **URL**: `/wallet-balances`
- **Method**: `GET`
- **描述**: 获取当前用户钱包余额
- **认证**: 需要Bearer Token

#### 请求头
```
Authorization: Bearer <jwt_token>
```

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "amount": "1000.00000000",
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

#### 错误码
| 错误码 | 描述 |
|--------|------|
| 401 | 未认证或Token无效 |

#### 示例
```bash
curl -X GET http://localhost:1337/api/wallet-balances \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 1.2 创建/更新钱包余额

#### 接口信息
- **URL**: `/wallet-balances`
- **Method**: `POST`
- **描述**: 创建或更新钱包余额（管理员功能）
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "amount": "1000.00000000"
  }
}
```

#### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| amount | string | 是 | 余额金额，精确到8位小数 |

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "amount": "1000.00000000",
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

## 2. 钱包交易记录

### 2.1 获取交易记录

#### 接口信息
- **URL**: `/wallet-txes`
- **Method**: `GET`
- **描述**: 获取当前用户钱包交易记录
- **认证**: 需要Bearer Token

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| sort | string | 否 | 排序字段，如 `createdAt:desc` |
| pagination[page] | number | 否 | 页码，默认1 |
| pagination[pageSize] | number | 否 | 每页数量，默认25 |
| filters[txType] | string | 否 | 交易类型过滤 |
| filters[direction] | string | 否 | 方向过滤（in/out） |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "txType": "deposit",
        "direction": "in",
        "amount": "100.00000000",
        "walletStatus": "success",
        "txHash": "0x1234567890abcdef...",
        "asset": 1,
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

#### 交易类型说明
| txType | 描述 |
|--------|------|
| deposit | 充值 |
| withdraw | 提现 |
| subscription | 认购 |
| static | 静态收益 |
| referral | 返佣 |
| principal_return | 本金返还 |
| lottery_spin | 抽奖消费 |
| lottery_prize | 抽奖奖励 |
| aiToken | AI代币解锁 |

#### 示例
```bash
# 获取所有交易记录
curl -X GET "http://localhost:1337/api/wallet-txes" \
  -H "Authorization: Bearer <token>"

# 获取充值记录
curl -X GET "http://localhost:1337/api/wallet-txes?filters[txType]=deposit" \
  -H "Authorization: Bearer <token>"

# 分页查询
curl -X GET "http://localhost:1337/api/wallet-txes?pagination[page]=1&pagination[pageSize]=10" \
  -H "Authorization: Bearer <token>"
```

### 2.2 创建交易记录

#### 接口信息
- **URL**: `/wallet-txes`
- **Method**: `POST`
- **描述**: 创建钱包交易记录（系统内部使用）
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "txType": "deposit",
    "direction": "in",
    "amount": "100.00000000",
    "walletStatus": "success",
    "txHash": "0x1234567890abcdef...",
    "asset": 1
  }
}
```

#### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| txType | string | 是 | 交易类型 |
| direction | string | 是 | 方向（in/out） |
| amount | string | 是 | 金额 |
| walletStatus | string | 是 | 状态（success/pending/failed） |
| txHash | string | 否 | 区块链交易哈希 |
| asset | number | 是 | 资产ID（1=USDT） |

## 3. 充值地址

### 3.1 获取充值地址

#### 接口信息
- **URL**: `/deposit-addresses`
- **Method**: `GET`
- **描述**: 获取当前用户充值地址
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "address": "0x1234567890abcdef1234567890abcdef12345678",
        "network": "BSC",
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
| address | string | BSC网络地址 |
| network | string | 网络类型（BSC） |

### 3.2 创建充值地址

#### 接口信息
- **URL**: `/deposit-addresses`
- **Method**: `POST`
- **描述**: 为用户创建充值地址（系统自动创建）
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "network": "BSC"
  }
}
```

## 4. 提现功能

### 4.1 创建提现请求

#### 接口信息
- **URL**: `/withdraw-requests`
- **Method**: `POST`
- **描述**: 创建提现请求
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "amountUSDT": "100.00000000",
    "toAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

#### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| amountUSDT | string | 是 | 提现金额 |
| toAddress | string | 是 | 提现地址（BEP-20格式） |

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "amountUSDT": "100.00000000",
      "toAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "status": "pending",
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

#### 错误码
| 错误码 | 描述 |
|--------|------|
| 400 | 余额不足 |
| 400 | 地址格式错误 |
| 400 | 超过每日提现限制 |

### 4.2 获取提现记录

#### 接口信息
- **URL**: `/withdraw-requests`
- **Method**: `GET`
- **描述**: 获取提现记录
- **认证**: 需要Bearer Token

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| sort | string | 否 | 排序字段 |
| pagination[page] | number | 否 | 页码 |
| pagination[pageSize] | number | 否 | 每页数量 |
| filters[status] | string | 否 | 状态过滤 |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "amountUSDT": "100.00000000",
        "toAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "status": "success",
        "txHash": "0xabcdef1234567890...",
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

#### 状态说明
| status | 描述 |
|--------|------|
| pending | 处理中 |
| success | 成功 |
| failed | 失败 |

## 5. 自定义提现接口

### 接口信息
- **URL**: `/wallet/withdraw`
- **Method**: `POST`
- **描述**: 自定义提现接口
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "amountUSDT": "100.00000000",
  "toAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

#### 响应体
```json
{
  "success": true,
  "withdrawId": 1,
  "message": "提现请求已创建"
}
```

## 注意事项

1. **金额精度**: 所有金额字段使用8位小数精度
2. **地址格式**: 充值地址和提现地址都必须是有效的BEP-20地址
3. **交易哈希**: 区块链交易会记录txHash字段
4. **状态同步**: 提现状态会实时同步区块链交易状态
5. **余额冻结**: 提现时会立即冻结相应余额

## 错误处理

所有API错误都会返回标准格式：

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

## 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 余额不足 | 检查钱包余额 |
| 400 | 地址格式错误 | 检查BEP-20地址格式 |
| 400 | 超过每日提现限制 | 等待次日或联系客服 |
| 401 | 未认证 | 检查Token是否有效 |
| 403 | 权限不足 | 检查用户权限 | 