# USDT 充值/提现自动化系统 - 前端对接指南

## 📋 系统概述

本系统实现了完整的USDT充值/提现自动化闭环：

- **充值流程**: 用户扫码 → 转账到项目方钱包 → 区块链监听 → 自动更新余额
- **提现流程**: 用户申请 → 冻结余额 → 自动广播交易 → 更新状态

## 🔌 API接口

### 1. 获取充值地址
```http
GET /wallet/deposit-address
Authorization: Bearer <JWT_TOKEN>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "asset": "USDT",
    "chain": "BSC"
  }
}
```

### 2. 提现申请
```http
POST /wallet/withdraw-usdt
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "amount": "100.5",
  "toAddress": "0xDEF..."
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "提现申请已提交",
  "data": {
    "withdrawId": 123,
    "amount": "100.5",
    "toAddress": "0xDEF...",
    "status": "pending"
  }
}
```

### 3. 获取钱包余额
```http
GET /wallet-balances
Authorization: Bearer <JWT_TOKEN>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "usdtBalance": "500.0",
    "aiTokenBalance": "1000.0"
  }
}
```

## 📡 Socket.IO 实时通知

### 连接配置
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:1337', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### 充值通知
```javascript
// 监听充值成功
socket.on('deposit:confirmed', (data) => {
  console.log('充值成功:', data);
  // data: { amount: "100.5", txHash: "0x..." }
  
  // 显示成功提示
  showToast('充值成功！');
  
  // 刷新余额
  refreshBalance();
});

// 监听充值等待
socket.on('deposit:pending', (data) => {
  console.log('等待充值确认:', data);
  // data: { address: "0x..." }
  
  // 显示等待动画
  showLoading('等待链上确认...');
});
```

### 提现通知
```javascript
// 监听提现申请提交
socket.on('withdraw:created', (data) => {
  console.log('提现申请已提交:', data);
  showToast('提现申请已提交，正在处理...');
});

// 监听提现成功
socket.on('withdraw:success', (data) => {
  console.log('提现成功:', data);
  // data: { amount: "100.5", txHash: "0x..." }
  
  showToast('提现已上链！');
  navigateToTransactionHistory();
});

// 监听提现失败
socket.on('withdraw:failed', (data) => {
  console.log('提现失败:', data);
  // data: { amount: "100.5", error: "余额不足" }
  
  showToast('提现失败，余额已退回');
  refreshBalance();
});
```

## 🎨 前端页面实现

### 1. 充值页面 (`/deposit`)

```javascript
import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const DepositPage = () => {
  const [depositData, setDepositData] = useState(null);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    // 获取充值地址
    fetchDepositAddress();
    
    // 监听充值成功
    socket.on('deposit:confirmed', handleDepositConfirmed);
    socket.on('deposit:pending', handleDepositPending);
    
    return () => {
      socket.off('deposit:confirmed');
      socket.off('deposit:pending');
    };
  }, []);

  const fetchDepositAddress = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/deposit-address', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      const data = await response.json();
      setDepositData(data.data);
      
      // 发送等待通知
      socket.emit('deposit:pending', { address: data.data.address });
    } catch (error) {
      console.error('获取充值地址失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositConfirmed = (data) => {
    showToast('充值成功！');
    refreshBalance();
  };

  const handleDepositPending = (data) => {
    showLoading('等待链上确认...');
  };

  return (
    <div className="deposit-page">
      {loading ? (
        <div className="loading">加载中...</div>
      ) : depositData ? (
        <div className="deposit-content">
          <h2>USDT 充值</h2>
          <div className="qr-code">
            <img src={depositData.qrCode} alt="充值二维码" />
          </div>
          <div className="address">
            <p>充值地址:</p>
            <code>{depositData.address}</code>
            <button onClick={() => copyToClipboard(depositData.address)}>
              复制地址
            </button>
          </div>
          <div className="instructions">
            <p>请使用支持BSC网络的钱包扫描二维码或复制地址进行转账</p>
            <p>系统将自动检测到账情况</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
```

### 2. 提现页面 (`/withdraw`)

```javascript
import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const WithdrawPage = () => {
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    // 监听提现状态
    socket.on('withdraw:created', handleWithdrawCreated);
    socket.on('withdraw:success', handleWithdrawSuccess);
    socket.on('withdraw:failed', handleWithdrawFailed);
    
    return () => {
      socket.off('withdraw:created');
      socket.off('withdraw:success');
      socket.off('withdraw:failed');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !toAddress) {
      showToast('请填写完整信息');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/wallet/withdraw-usdt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ amount, toAddress })
      });
      
      const data = await response.json();
      if (data.success) {
        showToast('提现申请已提交');
      }
    } catch (error) {
      console.error('提现申请失败:', error);
      showToast('提现申请失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawCreated = (data) => {
    showToast('提现申请已提交，正在处理...');
  };

  const handleWithdrawSuccess = (data) => {
    showToast('提现已上链！');
    navigateToTransactionHistory();
  };

  const handleWithdrawFailed = (data) => {
    showToast('提现失败，余额已退回');
    refreshBalance();
  };

  return (
    <div className="withdraw-page">
      <h2>USDT 提现</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>提现金额 (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="请输入提现金额"
            step="0.01"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label>提现地址</label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="请输入BEP-20地址"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '提交中...' : '提交提现申请'}
        </button>
      </form>
    </div>
  );
};
```

### 3. Socket Hook

```javascript
// hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:1337', {
        auth: {
          token: localStorage.getItem('jwt_token')
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket连接成功');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket连接断开');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};
```

## 🔧 环境配置

### 后端环境变量
```bash
# .env
PROJECT_WALLET_PRIVATE_KEY=your_private_key_here
BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

### 前端环境变量
```bash
# .env
REACT_APP_API_URL=http://localhost:1337
REACT_APP_SOCKET_URL=http://localhost:1337
```

## 📊 状态管理

### 充值状态
- `pending`: 等待链上确认
- `confirmed`: 充值成功

### 提现状态
- `pending`: 等待处理
- `success`: 提现成功
- `failed`: 提现失败

## 🛡️ 安全注意事项

1. **JWT认证**: 所有API请求都需要有效的JWT token
2. **地址验证**: 提现地址必须是有效的BEP-20地址
3. **余额检查**: 提现前会检查用户余额是否充足
4. **私钥安全**: 项目方钱包私钥必须安全存储，不要暴露在代码中

## 🚀 部署检查清单

- [ ] 后端API服务正常运行
- [ ] 区块链监听Job已启动
- [ ] 提现广播Job已启动
- [ ] Socket.IO服务已配置
- [ ] 环境变量已正确设置
- [ ] 前端已正确配置API地址
- [ ] 权限设置已完成

## 📞 技术支持

如有问题，请检查：
1. 网络连接是否正常
2. JWT token是否有效
3. 区块链网络是否稳定
4. 项目方钱包是否有足够USDT余额 