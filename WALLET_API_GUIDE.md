# 钱包系统API接口文档

## 基础信息
- **Base URL**: `http://118.107.4.158:1337/api`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 1. 用户注册

### 1.1 普通注册
```bash
POST /auth/local/register
```

**请求体:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**响应体:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "diamondId": "qJX3pZ8kL",
    "referralCode": "mN9vK2xR5",
    "createdAt": "2025-07-20T07:00:00.000Z"
  }
}
```

### 1.2 邀请码注册
```bash
POST /wallet/auth/invite-register
```

**请求体:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "inviteCode": "string"
}
```

**响应体:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "invitee",
    "email": "invitee@example.com",
    "diamondId": "wP7tH4nM8",
    "referralCode": "kL5vB9xR2",
    "invitedBy": 1,
    "createdAt": "2025-07-20T07:00:00.000Z"
  }
}
```

## 2. 钱包功能

### 2.1 查询余额
```bash
GET /wallet-balances
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**响应体:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usdtBalance": 0,
      "aiTokenBalance": 0,
      "createdAt": "2025-07-20T07:00:00.000Z"
    }
  ]
}
```

### 2.2 获取充值地址
```bash
GET /wallet-balances/deposit-address
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**响应体:**
```json
{
  "success": true,
  "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
  "network": "BSC",
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAThSURBVO3BQY4jRxAEwfAC//9l1x7zVECjk6MdKczwj1QtOaladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhZ98hKQn6RmAvKEmgnIjZoJyKRmAnKjZgIyqZmA/CQ1b5xULTqpWnRSteiTZWo2AfkmNb+Jmk1ANp1ULTqpWnRSteiTLwPyhJon1ExAJjU3QJ5QMwG5UTMBmdS8AeQJNd90UrXopGrRSdWiT745IJOaCcgTat5Q8wSQSc1vdlK16KRq0UnVok9+OTUTkBs1N0AmNTdqboBMaiYg/yUnVYtOqhadVC365MvU/E2ATGq+Sc0EZJOav8lJ1aKTqkUnVYs+WQbkJwGZ1ExAJjUTkEnNBGRSMwGZ1ExAJjUTkCeA/M1OqhadVC06qVqEf+QXA3KjZgJyo+YJIJOa/7OTqkUnVYtOqhZ98hKQSc0E5EbNBOQJNROQCcikZgIyAZnUTEDeADKpuQEyqbkBMqmZgNyoeeOkatFJ1aKTqkWfvKRmAnKjZgIyqbkBMgGZ1DyhZgLyBpAbNZuAPKFmArLppGrRSdWik6pFn/wwIE8AmdT8TdTcAHlDzQTkRs0EZFIzqdl0UrXopGrRSdWiT36YmgnIBGRSswnIpOYJNROQSc2kZgLyhJobNROQSc0EZFKz6aRq0UnVopOqRZ8sU/OEmhsgN2omIJOaSc0EZFKzCcikZgLyTUAmNd90UrXopGrRSdWiT14CMqmZgLyhZgLyBpAbIJOaGzXfBOQJNROQCciNmjdOqhadVC06qVr0yUtqJiCTmhsgN0DeADKpuQFyA2RSc6NmAvKGmgnIE2omIJtOqhadVC06qVr0yUtAboDcqHkDyI2aCcgmIJOaGzU3QCY1E5An1ExAJjWbTqoWnVQtOqlahH/kBwG5UTMBuVEzAblRMwGZ1ExAbtRMQCY1E5An1NwAmdQ8AWRS88ZJ1aKTqkUnVYs+WQbkRs0TaiYgE5BJzQTkDTU/Sc0Tap4AMqnZdFK16KRq0UnVIvwjLwCZ1DwB5Ak1bwC5UTMBuVHzBpAbNROQSc3f5KRq0UnVopOqRfhHvgjIE2pugDyhZgIyqZmATGomIG+ouQHyhJobIJOabzqpWnRSteikatEny4BMaiYgk5oJyBNqJiBPANmk5gbIJiCTmieATGreOKladFK16KRq0SfL1NyouVHzBJBJzQRkUjMBmdQ8oWYCMql5Qs0TQG7U/KSTqkUnVYtOqhZ98hKQn6TmBsik5kbNDZB/E5BJzQ2QSc2Nmk0nVYtOqhadVC36ZJmaTUB+EpBJzQ2Qb1KzCcikZtNJ1aKTqkUnVYs++TIgT6h5Qs0E5AbIpGZS84aaGzUTkAnIJiCTmgnIpOaNk6pFJ1WLTqoWffLLAbkBMql5AsikZlKzSc0NkE1qNp1ULTqpWnRSteiT/zkgN2qeAHKj5gbIE2reADKpeeOkatFJ1aKTqkWffJmab1JzA+QJNROQGzWTmgnIBGRSMwGZ1ExAboBMaiYgk5pNJ1WLTqoWnVQt+mQZkJ8EZFLzhJoJyBNAnlAzAZnUvKHm33RSteikatFJ1SL8I1VLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkX/AKryRED+vsMDAAAAAElFTkSuQmCC"
}
```

## 3. 提现功能

### 3.1 USDT提现
```bash
POST /usdt-withdraws
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**请求体:**
```json
{
  "amountUSDT": "100.00",
  "toAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6"
}
```

**响应体:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amountUSDT": "100.00",
    "toAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "status": "pending",
    "createdAt": "2025-07-20T07:00:00.000Z"
  }
}
```

### 3.2 查看提现记录
```bash
GET /usdt-withdraws
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**响应体:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amountUSDT": "100.00",
      "toAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
      "status": "success",
      "txHash": "0x1234567890abcdef...",
      "createdAt": "2025-07-20T07:00:00.000Z"
    }
  ]
}
```

## 4. 错误码说明

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求体格式 |
| 401 | 未认证 | 添加有效的JWT Token |
| 403 | 权限不足 | 确认用户角色权限 |
| 404 | 资源不存在 | 检查API路径 |
| 500 | 服务器内部错误 | 联系管理员 |

## 5. 前端集成示例

### 5.1 注册流程
```javascript
// 1. 普通注册
const registerResponse = await axios.post('/api/auth/local/register', {
  username: 'testuser',
  email: 'test@example.com',
  password: 'test123456'
});

// 2. 邀请码注册
const inviteResponse = await axios.post('/api/wallet/auth/invite-register', {
  username: 'invitee',
  email: 'invitee@example.com',
  password: 'test123456',
  inviteCode: 'qJX3pZ8kL'
});

// 3. 保存JWT
localStorage.setItem('jwt', registerResponse.data.jwt);
```

### 5.2 钱包操作
```javascript
// 设置请求头
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwt')}`;

// 查询余额
const balance = await axios.get('/api/wallet-balances');

// 获取充值地址
const address = await axios.get('/api/wallet-balances/deposit-address');

// 提交提现
const withdraw = await axios.post('/api/usdt-withdraws', {
  amountUSDT: '100.00',
  toAddress: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
});
```

## 6. 注意事项

1. **JWT Token**: 所有需要认证的API都需要在请求头中携带JWT Token
2. **邀请码**: 每个用户注册后都会自动生成唯一的邀请码
3. **充值**: 用户向充值地址转账后，系统会自动检测并更新余额
4. **提现**: 提现请求会进入队列，由后台自动处理
5. **区块链**: 系统支持BSC网络上的USDT代币操作 

## 基础信息
- **Base URL**: `http://118.107.4.158:1337/api`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 1. 用户注册

### 1.1 普通注册
```bash
POST /auth/local/register
```

**请求体:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**响应体:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "diamondId": "qJX3pZ8kL",
    "referralCode": "mN9vK2xR5",
    "createdAt": "2025-07-20T07:00:00.000Z"
  }
}
```

### 1.2 邀请码注册
```bash
POST /wallet/auth/invite-register
```

**请求体:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "inviteCode": "string"
}
```

**响应体:**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "invitee",
    "email": "invitee@example.com",
    "diamondId": "wP7tH4nM8",
    "referralCode": "kL5vB9xR2",
    "invitedBy": 1,
    "createdAt": "2025-07-20T07:00:00.000Z"
  }
}
```

## 2. 钱包功能

### 2.1 查询余额
```bash
GET /wallet-balances
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**响应体:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usdtBalance": 0,
      "aiTokenBalance": 0,
      "createdAt": "2025-07-20T07:00:00.000Z"
    }
  ]
}
```

### 2.2 获取充值地址
```bash
GET /wallet-balances/deposit-address
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**响应体:**
```json
{
  "success": true,
  "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
  "network": "BSC",
  "qrcode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAAThSURBVO3BQY4jRxAEwfAC//9l1x7zVECjk6MdKczwj1QtOaladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYtOqhZ98hKQn6RmAvKEmgnIjZoJyKRmAnKjZgIyqZmA/CQ1b5xULTqpWnRSteiTZWo2AfkmNb+Jmk1ANp1ULTqpWnRSteiTLwPyhJon1ExAJjU3QJ5QMwG5UTMBmdS8AeQJNd90UrXopGrRSdWiT745IJOaCcgTat5Q8wSQSc1vdlK16KRq0UnVok9+OTUTkBs1N0AmNTdqboBMaiYg/yUnVYtOqhadVC365MvU/E2ATGq+Sc0EZJOav8lJ1aKTqkUnVYs+WQbkJwGZ1ExAJjUTkEnNBGRSMwGZ1ExAJjUTkCeA/M1OqhadVC06qVqEf+QXA3KjZgJyo+YJIJOa/7OTqkUnVYtOqhZ98hKQSc0E5EbNBOQJNROQCcikZgIyAZnUTEDeADKpuQEyqbkBMqmZgNyoeeOkatFJ1aKTqkWfvKRmAnKjZgIyqbkBMgGZ1DyhZgLyBpAbNZuAPKFmArLppGrRSdWik6pFn/wwIE8AmdT8TdTcAHlDzQTkRs0EZFIzqdl0UrXopGrRSdWiT36YmgnIBGRSswnIpOYJNROQSc2kZgLyhJobNROQSc0EZFKz6aRq0UnVopOqRZ8sU/OEmhsgN2omIJOaSc0EZFKzCcikZgLyTUAmNd90UrXopGrRSdWiT14CMqmZgLyhZgLyBpAbIJOaGzXfBOQJNROQCciNmjdOqhadVC06qVr0yUtqJiCTmhsgN0DeADKpuQFyA2RSc6NmAvKGmgnIE2omIJtOqhadVC06qVr0yUtAboDcqHkDyI2aCcgmIJOaGzU3QCY1E5An1ExAJjWbTqoWnVQtOqlahH/kBwG5UTMBuVEzAblRMwGZ1ExAbtRMQCY1E5An1NwAmdQ8AWRS88ZJ1aKTqkUnVYs+WQbkRs0TaiYgE5BJzQTkDTU/Sc0Tap4AMqnZdFK16KRq0UnVIvwjLwCZ1DwB5Ak1bwC5UTMBuVHzBpAbNROQSc3f5KRq0UnVopOqRfhHvgjIE2pugDyhZgIyqZmATGomIG+ouQHyhJobIJOabzqpWnRSteikatEny4BMaiYgk5oJyBNqJiBPANmk5gbIJiCTmieATGreOKladFK16KRq0SfL1NyouVHzBJBJzQRkUjMBmdQ8oWYCMql5Qs0TQG7U/KSTqkUnVYtOqhZ98hKQn6TmBsik5kbNDZB/E5BJzQ2QSc2Nmk0nVYtOqhadVC36ZJmaTUB+EpBJzQ2Qb1KzCcikZtNJ1aKTqkUnVYs++TIgT6h5Qs0E5AbIpGZS84aaGzUTkAnIJiCTmgnIpOaNk6pFJ1WLTqoWffLLAbkBMql5AsikZlKzSc0NkE1qNp1ULTqpWnRSteiT/zkgN2qeAHKj5gbIE2reADKpeeOkatFJ1aKTqkWffJmab1JzA+QJNROQGzWTmgnIBGRSMwGZ1ExAboBMaiYgk5pNJ1WLTqoWnVQt+mQZkJ8EZFLzhJoJyBNAnlAzAZnUvKHm33RSteikatFJ1SL8I1VLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkX/AKryRED+vsMDAAAAAElFTkSuQmCC"
}
```

## 3. 提现功能

### 3.1 USDT提现
```bash
POST /usdt-withdraws
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**请求体:**
```json
{
  "amountUSDT": "100.00",
  "toAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6"
}
```

**响应体:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amountUSDT": "100.00",
    "toAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "status": "pending",
    "createdAt": "2025-07-20T07:00:00.000Z"
  }
}
```

### 3.2 查看提现记录
```bash
GET /usdt-withdraws
```

**请求头:**
```
Authorization: Bearer <jwt>
```

**响应体:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amountUSDT": "100.00",
      "toAddress": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
      "status": "success",
      "txHash": "0x1234567890abcdef...",
      "createdAt": "2025-07-20T07:00:00.000Z"
    }
  ]
}
```

## 4. 错误码说明

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求体格式 |
| 401 | 未认证 | 添加有效的JWT Token |
| 403 | 权限不足 | 确认用户角色权限 |
| 404 | 资源不存在 | 检查API路径 |
| 500 | 服务器内部错误 | 联系管理员 |

## 5. 前端集成示例

### 5.1 注册流程
```javascript
// 1. 普通注册
const registerResponse = await axios.post('/api/auth/local/register', {
  username: 'testuser',
  email: 'test@example.com',
  password: 'test123456'
});

// 2. 邀请码注册
const inviteResponse = await axios.post('/api/wallet/auth/invite-register', {
  username: 'invitee',
  email: 'invitee@example.com',
  password: 'test123456',
  inviteCode: 'qJX3pZ8kL'
});

// 3. 保存JWT
localStorage.setItem('jwt', registerResponse.data.jwt);
```

### 5.2 钱包操作
```javascript
// 设置请求头
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwt')}`;

// 查询余额
const balance = await axios.get('/api/wallet-balances');

// 获取充值地址
const address = await axios.get('/api/wallet-balances/deposit-address');

// 提交提现
const withdraw = await axios.post('/api/usdt-withdraws', {
  amountUSDT: '100.00',
  toAddress: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
});
```

## 6. 注意事项

1. **JWT Token**: 所有需要认证的API都需要在请求头中携带JWT Token
2. **邀请码**: 每个用户注册后都会自动生成唯一的邀请码
3. **充值**: 用户向充值地址转账后，系统会自动检测并更新余额
4. **提现**: 提现请求会进入队列，由后台自动处理
5. **区块链**: 系统支持BSC网络上的USDT代币操作 