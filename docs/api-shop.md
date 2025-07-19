# 商店系统 API 文档

## 概述
商店系统提供商品管理、订单创建、库存管理等功能。

## 基础信息
- **Base URL**: `http://localhost:1337/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

## 1. 商店商品

### 1.1 获取商品列表

#### 接口信息
- **URL**: `/store-products`
- **Method**: `GET`
- **描述**: 获取所有商店商品
- **认证**: 可选

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| filters[enabled] | boolean | 否 | 是否启用过滤 |
| sort | string | 否 | 排序字段，如 `price:asc` |
| pagination[page] | number | 否 | 页码，默认1 |
| pagination[pageSize] | number | 否 | 每页数量，默认25 |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "iPhone 15 Pro",
        "description": "最新款iPhone，性能强劲",
        "price": "999.00000000",
        "originalPrice": "1099.00000000",
        "stockQty": 50,
        "category": "electronics",
        "image": "https://example.com/iphone.jpg",
        "enabled": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    },
    {
      "id": 2,
      "attributes": {
        "name": "MacBook Pro",
        "description": "专业级笔记本电脑",
        "price": "1999.00000000",
        "originalPrice": "2199.00000000",
        "stockQty": 20,
        "category": "electronics",
        "image": "https://example.com/macbook.jpg",
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
| name | string | 商品名称 |
| description | string | 商品描述 |
| price | string | 当前价格 |
| originalPrice | string | 原价 |
| stockQty | number | 库存数量 |
| category | string | 商品分类 |
| image | string | 商品图片URL |
| enabled | boolean | 是否启用 |

#### 示例
```bash
# 获取所有商品
curl -X GET "http://localhost:1337/api/store-products"

# 获取启用的商品
curl -X GET "http://localhost:1337/api/store-products?filters[enabled]=true"

# 按价格排序
curl -X GET "http://localhost:1337/api/store-products?sort=price:asc"

# 分页查询
curl -X GET "http://localhost:1337/api/store-products?pagination[page]=1&pagination[pageSize]=10"
```

### 1.2 获取单个商品

#### 接口信息
- **URL**: `/store-products/:id`
- **Method**: `GET`
- **描述**: 获取单个商品详情
- **认证**: 可选

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "iPhone 15 Pro",
      "description": "最新款iPhone，性能强劲，搭载A17 Pro芯片",
      "price": "999.00000000",
      "originalPrice": "1099.00000000",
      "stockQty": 50,
      "category": "electronics",
      "image": "https://example.com/iphone.jpg",
      "enabled": true,
      "shop_orders": {
        "data": []
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 1.3 创建商品

#### 接口信息
- **URL**: `/store-products`
- **Method**: `POST`
- **描述**: 创建商店商品（管理员功能）
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "name": "iPhone 15 Pro",
    "description": "最新款iPhone，性能强劲",
    "price": "999.00000000",
    "originalPrice": "1099.00000000",
    "stockQty": 50,
    "category": "electronics",
    "image": "https://example.com/iphone.jpg",
    "enabled": true
  }
}
```

#### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| name | string | 是 | 商品名称 |
| description | string | 否 | 商品描述 |
| price | string | 是 | 当前价格 |
| originalPrice | string | 否 | 原价 |
| stockQty | number | 是 | 库存数量 |
| category | string | 否 | 商品分类 |
| image | string | 否 | 商品图片URL |
| enabled | boolean | 否 | 是否启用，默认true |

## 2. 商店订单

### 2.1 创建商店订单

#### 接口信息
- **URL**: `/shop-orders`
- **Method**: `POST`
- **描述**: 创建商店订单
- **认证**: 需要Bearer Token

#### 请求体
```json
{
  "data": {
    "productId": 1,
    "quantity": 1,
    "shippingAddress": "北京市朝阳区xxx街道xxx号",
    "shippingPhone": "13800138000",
    "shippingName": "张三"
  }
}
```

#### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| productId | number | 是 | 商品ID |
| quantity | number | 是 | 购买数量 |
| shippingAddress | string | 是 | 收货地址 |
| shippingPhone | string | 是 | 收货电话 |
| shippingName | string | 是 | 收货人姓名 |

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "quantity": 1,
      "totalAmount": "999.00000000",
      "orderStatus": "pending",
      "shippingAddress": "北京市朝阳区xxx街道xxx号",
      "shippingPhone": "13800138000",
      "shippingName": "张三",
      "trackingNo": null,
      "product": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "iPhone 15 Pro",
            "price": "999.00000000"
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

#### 错误码
| 错误码 | 描述 |
|--------|------|
| 400 | 商品不存在或已禁用 |
| 400 | 库存不足 |
| 400 | 余额不足 |
| 400 | 数量无效 |

### 2.2 获取商店订单列表

#### 接口信息
- **URL**: `/shop-orders`
- **Method**: `GET`
- **描述**: 获取当前用户的商店订单
- **认证**: 需要Bearer Token

#### 请求参数
| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| sort | string | 否 | 排序字段，如 `createdAt:desc` |
| pagination[page] | number | 否 | 页码，默认1 |
| pagination[pageSize] | number | 否 | 每页数量，默认25 |
| filters[orderStatus] | string | 否 | 订单状态过滤 |
| filters[product] | number | 否 | 商品ID过滤 |

#### 响应体
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "quantity": 1,
        "totalAmount": "999.00000000",
        "orderStatus": "paid",
        "shippingAddress": "北京市朝阳区xxx街道xxx号",
        "shippingPhone": "13800138000",
        "shippingName": "张三",
        "trackingNo": "SF1234567890",
        "product": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "iPhone 15 Pro",
              "price": "999.00000000",
              "image": "https://example.com/iphone.jpg"
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
| totalAmount | string | 订单总金额 |
| orderStatus | string | 订单状态 |
| shippingAddress | string | 收货地址 |
| shippingPhone | string | 收货电话 |
| shippingName | string | 收货人姓名 |
| trackingNo | string | 物流单号 |

#### 订单状态说明
| orderStatus | 描述 |
|-------------|------|
| pending | 待支付 |
| paid | 已支付 |
| shipped | 已发货 |
| delivered | 已送达 |
| cancelled | 已取消 |

#### 示例
```bash
# 获取所有订单
curl -X GET "http://localhost:1337/api/shop-orders" \
  -H "Authorization: Bearer <token>"

# 获取已支付订单
curl -X GET "http://localhost:1337/api/shop-orders?filters[orderStatus]=paid" \
  -H "Authorization: Bearer <token>"

# 按时间排序
curl -X GET "http://localhost:1337/api/shop-orders?sort=createdAt:desc" \
  -H "Authorization: Bearer <token>"
```

### 2.3 获取单个商店订单

#### 接口信息
- **URL**: `/shop-orders/:id`
- **Method**: `GET`
- **描述**: 获取单个商店订单详情
- **认证**: 需要Bearer Token

#### 响应体
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "quantity": 1,
      "totalAmount": "999.00000000",
      "orderStatus": "paid",
      "shippingAddress": "北京市朝阳区xxx街道xxx号",
      "shippingPhone": "13800138000",
      "shippingName": "张三",
      "trackingNo": "SF1234567890",
      "product": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "iPhone 15 Pro",
            "description": "最新款iPhone，性能强劲",
            "price": "999.00000000",
            "originalPrice": "1099.00000000",
            "stockQty": 49,
            "category": "electronics",
            "image": "https://example.com/iphone.jpg",
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

## 3. 订单流程

### 3.1 订单创建流程
1. **验证商品**: 检查商品是否存在且启用
2. **检查库存**: 验证库存是否充足
3. **计算金额**: 商品价格 × 数量
4. **检查余额**: 验证用户余额是否充足
5. **扣除余额**: 从用户钱包扣除相应金额
6. **创建订单**: 创建商店订单记录
7. **更新库存**: 减少商品库存
8. **创建交易**: 创建钱包交易记录

### 3.2 订单状态流转
```
pending → paid → shipped → delivered
    ↓
cancelled
```

### 3.3 订单处理逻辑
```javascript
// 1. 验证商品
const product = await getProduct(productId);
if (!product || !product.enabled) {
  throw new Error('PRODUCT_NOT_FOUND');
}

// 2. 检查库存
if (product.stockQty < quantity) {
  throw new Error('INSUFFICIENT_STOCK');
}

// 3. 计算总金额
const totalAmount = product.price * quantity;

// 4. 检查用户余额
const userBalance = await getUserBalance(userId);
if (userBalance < totalAmount) {
  throw new Error('INSUFFICIENT_BALANCE');
}

// 5. 扣除余额
await updateUserBalance(userId, userBalance - totalAmount);

// 6. 创建订单
const order = await createShopOrder({
  productId,
  quantity,
  totalAmount,
  shippingAddress,
  shippingPhone,
  shippingName,
  userId
});

// 7. 更新库存
await updateProductStock(productId, product.stockQty - quantity);

// 8. 创建交易记录
await createWalletTx({
  txType: 'shop_order',
  direction: 'out',
  amount: totalAmount,
  walletStatus: 'success',
  user: userId,
  asset: 1 // USDT
});
```

## 4. 库存管理

### 4.1 库存检查
```javascript
// 检查库存是否充足
const checkStock = async (productId, quantity) => {
  const product = await getProduct(productId);
  return product.stockQty >= quantity;
};
```

### 4.2 库存扣减
```javascript
// 扣减库存
const updateStock = async (productId, quantity) => {
  const product = await getProduct(productId);
  await updateProduct(productId, {
    stockQty: product.stockQty - quantity
  });
};
```

### 4.3 库存恢复（订单取消）
```javascript
// 恢复库存
const restoreStock = async (productId, quantity) => {
  const product = await getProduct(productId);
  await updateProduct(productId, {
    stockQty: product.stockQty + quantity
  });
};
```

## 5. 物流管理

### 5.1 发货处理
```javascript
// 发货
const shipOrder = async (orderId, trackingNo) => {
  await updateShopOrder(orderId, {
    orderStatus: 'shipped',
    trackingNo: trackingNo
  });
};
```

### 5.2 物流查询
```javascript
// 查询物流信息
const getShippingInfo = async (trackingNo) => {
  // 调用第三方物流API
  const shippingInfo = await queryShippingAPI(trackingNo);
  return shippingInfo;
};
```

## 6. 错误处理

### 常见错误码
| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 商品不存在 | 检查商品ID是否正确 |
| 400 | 商品已禁用 | 选择其他可用商品 |
| 400 | 库存不足 | 减少购买数量或选择其他商品 |
| 400 | 余额不足 | 先充值再购买 |
| 400 | 数量无效 | 检查数量参数 |
| 400 | 收货信息不完整 | 填写完整的收货信息 |
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

## 7. 注意事项

1. **库存管理**: 下单时立即扣减库存，取消时恢复库存
2. **余额检查**: 下单时立即扣除用户余额
3. **订单状态**: 严格按照状态流转规则处理
4. **物流跟踪**: 支持物流单号查询
5. **收货信息**: 必须填写完整的收货信息
6. **价格精度**: 所有金额字段使用8位小数精度

## 8. 示例场景

### 场景1：用户购买商品
```bash
# 1. 查看商品列表
GET /api/store-products

# 2. 查看商品详情
GET /api/store-products/1

# 3. 创建订单
POST /api/shop-orders

# 4. 查看订单状态
GET /api/shop-orders/1
```

### 场景2：管理员发货
```bash
# 1. 查看待发货订单
GET /api/shop-orders?filters[orderStatus]=paid

# 2. 更新订单状态为已发货
PUT /api/shop-orders/1

# 3. 添加物流单号
PUT /api/shop-orders/1
```

### 场景3：用户查看订单
```bash
# 1. 查看所有订单
GET /api/shop-orders

# 2. 查看订单详情
GET /api/shop-orders/1

# 3. 查看钱包交易记录
GET /api/wallet-txes?filters[txType]=shop_order
``` 