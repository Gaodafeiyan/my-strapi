/**
 * blockchain-listener service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::wallet-tx.wallet-tx' as any, ({ strapi }) => ({
  // 监听区块链充值事件
  async listenForDeposits() {
    try {
      console.log('🔍 开始监听区块链充值事件...');
      
      // 获取所有用户的充值地址
      const depositAddresses = await strapi.entityService.findMany('api::deposit-address.deposit-address' as any, {
        populate: ['user']
      });

      if (!depositAddresses || depositAddresses.length === 0) {
        console.log('ℹ️ 没有找到充值地址');
        return;
      }

      // 模拟从区块链获取最新交易
      // 实际项目中这里应该调用 BSC RPC 或 WebSocket
      const mockTransactions = await this.getMockBlockchainTransactions();
      
      for (const tx of mockTransactions) {
        await this.processDepositTransaction(tx);
      }

      console.log('✅ 区块链监听完成');
    } catch (error) {
      console.error('❌ 区块链监听失败:', error);
    }
  },

  // 模拟获取区块链交易（实际项目中替换为真实RPC调用）
  async getMockBlockchainTransactions() {
    // 模拟一些充值交易
    return [
      {
        hash: `0x${Date.now().toString(16)}abc123`,
        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        to: '0x1234567890abcdef1234567890abcdef12345678', // 模拟充值地址
        value: '1000000000000000000', // 1 USDT (18位小数)
        blockNumber: Date.now(),
        timestamp: Date.now()
      },
      {
        hash: `0x${Date.now().toString(16)}def456`,
        from: '0x9876543210fedcba9876543210fedcba98765432',
        to: '0xabcdef1234567890abcdef1234567890abcdef12', // 另一个充值地址
        value: '500000000000000000', // 0.5 USDT
        blockNumber: Date.now(),
        timestamp: Date.now()
      }
    ];
  },

  // 处理充值交易
  async processDepositTransaction(tx: any) {
    try {
      // 检查是否是USDT转账（实际项目中需要检查token合约地址）
      if (tx.value && parseFloat(tx.value) > 0) {
        const amount = parseFloat(tx.value) / Math.pow(10, 18); // 转换为USDT单位
        
        // 查找对应的充值地址
        const depositAddress = await strapi.entityService.findMany('api::deposit-address.deposit-address' as any, {
          filters: {
            address: tx.to
          },
          populate: ['user']
        });

        if (depositAddress && depositAddress.length > 0) {
          const user = depositAddress[0].user;
          
          // 检查是否已处理过此交易（防重复）
          const existingTx = await strapi.entityService.findMany('api::wallet-tx.wallet-tx' as any, {
            filters: {
              txHash: tx.hash
            }
          });

          if (existingTx && existingTx.length > 0) {
            console.log(`ℹ️ 交易已处理: ${tx.hash}`);
            return;
          }

          // 创建钱包交易记录
          const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
            data: {
              txHash: tx.hash,
              txType: 'deposit',
              direction: 'in',
              amount: amount,
              walletStatus: 'confirmed',
              user: user.id,
              asset: 1, // USDT asset ID
              blockNumber: tx.blockNumber,
              timestamp: tx.timestamp
            }
          });

          // 更新用户余额
          await this.updateUserBalance(user.id, amount);

          console.log(`✅ 充值处理成功: 用户 ${user.username}, 金额 ${amount} USDT`);
        }
      }
    } catch (error) {
      console.error('❌ 处理充值交易失败:', error);
    }
  },

  // 更新用户余额
  async updateUserBalance(userId: number, amount: number) {
    try {
      // 查找用户钱包余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: userId }
      });

      if (walletBalance && walletBalance.length > 0) {
        const currentBalance = walletBalance[0].amount;
        const newBalance = currentBalance + amount;

        // 更新余额
        await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
          data: {
            amount: newBalance
          }
        });

        console.log(`💰 余额更新: 用户 ${userId}, 原余额 ${currentBalance}, 新增 ${amount}, 新余额 ${newBalance}`);
      } else {
        // 如果用户没有钱包余额记录，创建一个
        await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            amount: amount,
            user: userId
          }
        });

        console.log(`💰 创建钱包余额: 用户 ${userId}, 余额 ${amount}`);
      }
    } catch (error) {
      console.error('❌ 更新用户余额失败:', error);
    }
  },

  // 补偿扫描（处理可能遗漏的交易）
  async compensateScan() {
    try {
      console.log('🔧 开始补偿扫描...');
      
      // 获取最近100个区块的交易
      const latestBlock = Date.now();
      const fromBlock = latestBlock - 100;
      
      // 模拟获取历史交易
      const historicalTxs = await this.getMockHistoricalTransactions(fromBlock, latestBlock);
      
      for (const tx of historicalTxs) {
        await this.processDepositTransaction(tx);
      }

      console.log('✅ 补偿扫描完成');
    } catch (error) {
      console.error('❌ 补偿扫描失败:', error);
    }
  },

  // 模拟获取历史交易
  async getMockHistoricalTransactions(fromBlock: number, toBlock: number) {
    // 模拟一些历史充值交易
    return [
      {
        hash: `0x${Date.now().toString(16)}comp123`,
        from: '0x1111111111111111111111111111111111111111',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        value: '2000000000000000000', // 2 USDT
        blockNumber: fromBlock + 50,
        timestamp: fromBlock + 50
      }
    ];
  }
})); 