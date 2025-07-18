# 0 → 1 后台建模总说明

## 技术约束

| 项目 | 约定 | 备注 |
|------|------|------|
| Strapi 版本 | 5.18.1 | 与线上一致 |
| Node 版本 | 18.20.6 | LTS |
| DB | PostgreSQL / 默认 public schema | |
| 模型 Kind | 一律 collectionType，关闭 draft/publish | |
| 命名规范 | 表名 snake + 复数 | |
| 内容‑类型 UID | api::<name>.<name> | |
| 绝不能创建 / 修改 | up_roles 或其 Content‑Type | 保留给插件内核 |

## 目录规划（Cursor 自动放置）

```
src/
├─ api/
│  ├─ banner/                # 公共展示
│  ├─ announcement/
│  ├─ token-asset/           # 行情 + 资产
│  ├─ token-price/
│  ├─ wallet-balance/        # 钱包
│  ├─ wallet-tx/
│  ├─ deposit-address/
│  ├─ withdraw-request/
│  ├─ subscription-plan/     # 认购
│  ├─ subscription-order/
│  ├─ referral-reward/
│  ├─ lottery-config/        # 淘金抽奖
│  ├─ lottery-prize/
│  ├─ lottery-spin/
│  ├─ store-product/         # 商城
│  └─ shop-order/
└─ extensions/
    └─ users-permissions/
        └─ content-types/
            └─ user/         # 只扩展 User，不动 Role
```

## 业务模型 & 字段

### 3‑1 扩展 User（up_users）

| 字段 | 类型 | 说明 |
|------|------|------|
| diamondId * | UID | 系统内唯一标识 |
| referralCode * | UID | 邀请码 |
| invitedBy | many‑to‑one → User | 上级 |
| invitees | one‑to‑many ← User | 下级 |
| wallet_balance | one‑to‑one → WalletBalance | |
| wallet_tx | one‑to‑many ← WalletTx | |
| subscription_orders | one‑to‑many ← SubscriptionOrder | |
| inviteRewards | one‑to‑many ← ReferralReward | |
| deposit_address | one‑to‑one → DepositAddress | |
| withdraw_requests | one‑to‑many ← WithdrawRequest | |
| lottery_spins | one‑to‑many ← LotterySpin | |
| shop_orders | one‑to‑many ← ShopOrder | |

### 3‑2 公共展示

| 模型 | 关键字段 |
|------|----------|
| Banner | title · image (media) · link · sortIdx:int |
| Announcement | title* · body:text · publishedAt:datetime |

### 3‑3 行情 & 资产

| 模型 | 字段 |
|------|------|
| TokenAsset | symbol* · chain(enum:BSC) · contract* · decimals:int(18) |
| TokenPrice | asset:m‑to‑1 → TokenAsset · priceUSD:decimal(20,8) · fetchedAt |

### 3‑4 钱包体系

| 模型 | 字段 |
|------|------|
| WalletBalance | amount:decimal(38,8) · user:o‑to‑1 ← User |
| WalletTx | txType(enum 见下) · direction(in/out) · amount · walletStatus(enum:pending/success/fail) · txHash(unique) · asset:m‑to‑1 TokenAsset · user:m‑to‑1 User |
| DepositAddress | address* · chain(enum BSC) · user:o‑to‑1 User |
| WithdrawRequest | toAddress* · amountUSDT · txHash(unique) · status(enum pending/…/fail) · feeGas · user:m‑to‑1 User |

**WalletTx.txType 允许值：** static referral aiToken lottery deposit withdraw shop.

### 3‑5 认购 & 返佣

| 模型 | 字段 |
|------|------|
| SubscriptionPlan | title · priceUSDT · cycleDays · staticYieldPct · aiTokenBonusPct · maxPurchaseCnt · unlockAfterCnt |
| SubscriptionOrder | orderState(pending/active/finished) · startAt · endAt · principalUSDT · staticYieldUSDT · aiTokenQty · redeemedAt · user:m‑to‑1 User · subscription_plan:m‑to‑1 SubscriptionPlan |
| ReferralReward | amountUSDT · fromOrder:m‑to‑1 SubscriptionOrder · referrer:m‑to‑1 User |

### 3‑6 淘金抽奖

| 模型 | 字段 |
|------|------|
| LotteryConfig | spinCostUSDT · enabled:boolean |
| LotteryPrize | title · probabilityWeight:int · stockQty:int(-1=无限) · image:media |
| LotterySpin | result:m‑to‑1 LotteryPrize · user:m‑to‑1 User · spentUSDT |

### 3‑7 商城

| 模型 | 字段 |
|------|------|
| StoreProduct | title* · sku:UID(target title) · priceUSDT · stockQty:int(-1) · cover · gallery[] · description:richtext |
| ShopOrder | orderState(pending/paid/shipped/finished/cancelled) · quantity:int* · totalPriceUSDT · user:m‑to‑1 User · product:m‑to‑1 StoreProduct · walletTx:o‑to‑1 WalletTx · paidAt |

## 权限矩阵（后台 → Settings → Roles）

| Role | Content‑Type | 权限动作 |
|------|-------------|----------|
| Public | 全部留空 | 仅保留 /auth/* |
| Authenticated | 上表所有模型 | • Find/Find One = 只读<br>• Create = ShopOrder / WithdrawRequest / SubscriptionOrder / LotterySpin<br>• Update = WithdrawRequest（管理员改状态） |

## ⚠️ 切记

1. **不要向 Content‑Type Builder 再建任何 "Role"**；保留插件内置。

2. 以上两条角色若被误删，可在 GUI 手动 "Add new role" 填写：
   Type = public / authenticated，保存即可。

## Cursor 操作文档

1. 粘贴本文件 → 让 Cursor 按目录把 schema.json 写入。
2. 运行 Rebuild；Strapi 会自动迁表。
3. 打开 Settings → Users & Permissions → Roles
4. 勾选权限表；保存。
5. 自测：注册 → 登陆 → 调试各业务接口。若需种子数据可用 Content Manager GUI 录入。

## 已创建的内容类型

✅ **User 扩展** - 包含所有关系字段
✅ **Banner** - 公共展示
✅ **Announcement** - 公告
✅ **TokenAsset** - 代币资产
✅ **TokenPrice** - 代币价格
✅ **WalletBalance** - 钱包余额
✅ **WalletTx** - 钱包交易
✅ **DepositAddress** - 充值地址
✅ **WithdrawRequest** - 提现请求
✅ **SubscriptionPlan** - 认购计划
✅ **SubscriptionOrder** - 认购订单
✅ **ReferralReward** - 推荐奖励
✅ **LotteryConfig** - 抽奖配置
✅ **LotteryPrize** - 抽奖奖品
✅ **LotterySpin** - 抽奖记录
✅ **StoreProduct** - 商城商品
✅ **ShopOrder** - 商城订单

所有内容类型已按照规范创建完成，包含正确的字段类型、关系和约束。 