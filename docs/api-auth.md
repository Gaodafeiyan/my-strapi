# 认证系统 API 文档

## 概述
认证系统提供用户注册、登录、JWT令牌管理等功能。

## 基础信息
- **Base URL**: `http://localhost:1337/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token

## 1. 用户注册

### 接口信息
- **URL**: `/auth/local/register`
- **Method**: `POST`
- **描述**: 用户注册（支持邀请码）

### 请求体
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "inviteCode": "string"
}
```

### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| username | string | 是 | 用户名，3-20字符 |
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码，6-20字符 |
| inviteCode | string | 是 | 邀请码 |

### 响应体
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "diamondId": "D123456",
    "referralCode": "UID123456",
    "invitedBy": {
      "id": 2,
      "username": "referrer"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 错误码
| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 409 | 用户名或邮箱已存在 |
| 400 | 邀请码无效 |

### 示例
```bash
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "123456",
    "inviteCode": "user"
  }'
```

## 2. 用户登录

### 接口信息
- **URL**: `/auth/local`
- **Method**: `POST`
- **描述**: 用户登录

### 请求体
```json
{
  "identifier": "string",
  "password": "string"
}
```

### 字段说明
| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| identifier | string | 是 | 用户名或邮箱 |
| password | string | 是 | 密码 |

### 响应体
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "diamondId": "D123456",
    "referralCode": "UID123456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 错误码
| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 用户名或密码错误 |

### 示例
```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "123456"
  }'
```

## 3. 获取当前用户信息

### 接口信息
- **URL**: `/users/me`
- **Method**: `GET`
- **描述**: 获取当前登录用户信息
- **认证**: 需要Bearer Token

### 请求头
```
Authorization: Bearer <jwt_token>
```

### 响应体
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "diamondId": "D123456",
  "referralCode": "UID123456",
  "invitedBy": {
    "id": 2,
    "username": "referrer"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 错误码
| 错误码 | 描述 |
|--------|------|
| 401 | 未认证或Token无效 |

### 示例
```bash
curl -X GET http://localhost:1337/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 4. 刷新Token

### 接口信息
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **描述**: 刷新JWT Token
- **认证**: 需要Bearer Token

### 请求头
```
Authorization: Bearer <jwt_token>
```

### 响应体
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

## 5. 登出

### 接口信息
- **URL**: `/auth/logout`
- **Method**: `POST`
- **描述**: 用户登出
- **认证**: 需要Bearer Token

### 请求头
```
Authorization: Bearer <jwt_token>
```

### 响应体
```json
{
  "message": "Logged out successfully"
}
```

## 用户扩展字段说明

### diamondId
- **类型**: string
- **描述**: 钻石ID，系统自动生成
- **格式**: "D" + 6位数字

### referralCode
- **类型**: string
- **描述**: 推荐码，基于用户ID生成
- **格式**: "UID" + 用户ID

### invitedBy
- **类型**: object
- **描述**: 邀请人信息
- **字段**: id, username

## 注意事项

1. **Token有效期**: JWT Token默认有效期为30天
2. **密码安全**: 密码在传输和存储时都会加密
3. **邀请码**: 注册时必须提供有效的邀请码
4. **用户名唯一性**: 用户名和邮箱都必须是唯一的
5. **时区**: 所有时间字段使用UTC时间戳

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