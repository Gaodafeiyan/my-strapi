# 🚀 服务器部署指南

## 1. 服务器环境准备

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 检查版本
node --version
npm --version
pm2 --version
```

## 2. 项目部署

```bash
# 克隆项目到服务器
git clone <your-repo-url> /var/www/my-strapi
cd /var/www/my-strapi

# 安装依赖
npm install

# 复制环境变量
cp env.example .env
```

## 3. 配置环境变量

编辑 `.env` 文件：

```env
# 数据库配置 (生产环境建议用MySQL/PostgreSQL)
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi_db
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=your_password

# JWT密钥 (生产环境必须修改)
JWT_SECRET=your-production-jwt-secret
ADMIN_JWT_SECRET=your-production-admin-jwt-secret
API_TOKEN_SALT=your-production-api-token-salt

# 区块链配置
PROJECT_WALLET_PRIVATE_KEY=your-actual-private-key
BSC_RPC_URL=https://bsc-dataseed.binance.org/
BSC_CHAIN_ID=56
USDT_CONTRACT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
PROJECT_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# 服务配置
BLOCKCHAIN_SCAN_INTERVAL=15
WITHDRAW_SCAN_INTERVAL=30

# 系统配置
NODE_ENV=production
PORT=1337
HOST=0.0.0.0
```

## 4. 初始化数据库

```bash
# 构建项目
npm run build

# 启动Strapi (首次运行会创建数据库)
npm run start

# 在另一个终端运行初始化脚本
node scripts/init-blockchain-config.js
node scripts/init-platform-wallets.js
```

## 5. 使用PM2启动服务

```bash
# 启动Strapi API服务
pm2 start npm --name "strapi-api" -- run start

# 启动区块链监听服务
pm2 start start-blockchain-services.js --name "blockchain-services"

# 查看服务状态
pm2 status

# 查看日志
pm2 logs blockchain-services
```

## 6. 设置开机自启

```bash
# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

## 7. 配置Nginx反向代理 (可选)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 8. 安全配置

```bash
# 设置防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 设置SSL证书 (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 9. 监控和维护

```bash
# 查看服务状态
pm2 status

# 重启服务
pm2 restart all

# 查看日志
pm2 logs

# 更新代码
git pull
npm install
npm run build
pm2 restart all
```

## 10. 备份策略

```bash
# 数据库备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u strapi_user -p strapi_db > backup_$DATE.sql
```

## 重要提醒

1. **私钥安全**: 确保 `PROJECT_WALLET_PRIVATE_KEY` 安全存储
2. **数据库备份**: 定期备份数据库
3. **监控日志**: 关注区块链服务日志
4. **更新维护**: 定期更新依赖包
5. **安全更新**: 及时更新系统安全补丁 