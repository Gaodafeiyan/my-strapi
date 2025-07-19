/**
 * USDT提现监听服务
 * 自动处理待处理的USDT提现请求
 */

export default {
  // 启动USDT提现监听器
  async startListener() {
    console.log('🚀 启动USDT提现监听器...');
    
    // 每30秒检查一次待处理的提现请求
    setInterval(async () => {
      await this.processPendingWithdrawals();
    }, 30000);
  },

  // 处理待处理的USDT提现
  async processPendingWithdrawals() {
    try {
      console.log('🔍 检查待处理的USDT提现请求...');

      const pendingWithdrawals = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw' as any, {
        filters: {
          status: 'pending'
        },
        sort: { requestedAt: 'asc' },
        limit: 10 // 每次处理10个请求
      }) as any[];

      if (pendingWithdrawals.length === 0) {
        console.log('✅ 没有待处理的USDT提现请求');
        return;
      }

      console.log(`📋 找到 ${pendingWithdrawals.length} 个待处理的USDT提现请求`);

      for (const withdrawal of pendingWithdrawals) {
        await this.processUSDTWithdrawal(withdrawal);
      }
    } catch (error) {
      console.error('❌ 处理USDT提现时出错:', error);
    }
  },

  // 处理单个USDT提现
  async processUSDTWithdrawal(withdrawal) {
    try {
      console.log(`🔄 处理USDT提现: ${withdrawal.amountUSDT} USDT -> ${withdrawal.toAddress}`);
      
      // 更新状态为处理中
      await strapi.entityService.update('api::usdt-withdraw.usdt-withdraw' as any, withdrawal.id, {
        data: {
          status: 'processing'
        }
      });

      // 获取平台USDT钱包
      const platformWallet = await strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
        filters: {
          isActive: true,
          tokenType: 'USDT',
          chain: 'BSC'
        },
        sort: { balance: 'desc' },
        limit: 1
      });

      if (!platformWallet || platformWallet.length === 0) {
        console.error('❌ 没有找到可用的平台USDT钱包');
        await this.updateWithdrawalStatus(withdrawal.id, 'failed', null, '没有可用的平台钱包');
        return false;
      }

      const wallet = platformWallet[0];
      console.log(`🏦 使用平台USDT钱包: ${wallet.address}`);

      // 检查平台钱包余额
      if (wallet.balance < parseFloat(withdrawal.amountUSDT)) {
        console.error(`❌ 平台钱包余额不足: ${wallet.balance} USDT < ${withdrawal.amountUSDT} USDT`);
        await this.updateWithdrawalStatus(withdrawal.id, 'failed', null, '平台钱包余额不足');
        return false;
      }

      // 模拟区块链交易处理
      // 这里应该调用实际的区块链API进行转账
      const success = Math.random() > 0.1; // 90%成功率
      
      if (success) {
        // 更新平台钱包余额
        await strapi.entityService.update('api::platform-wallet.platform-wallet' as any, wallet.id, {
          data: {
            balance: wallet.balance - parseFloat(withdrawal.amountUSDT),
            lastUpdated: new Date()
          }
        });

        // 生成模拟交易哈希
        const txHash = '0x' + Math.random().toString(16).substr(2, 64);

        console.log(`✅ USDT提现成功: ${withdrawal.amountUSDT} USDT`);
        console.log(`📤 从平台钱包: ${wallet.address}`);
        console.log(`📥 到用户地址: ${withdrawal.toAddress}`);
        console.log(`🔗 交易哈希: ${txHash}`);

        await this.updateWithdrawalStatus(withdrawal.id, 'success', txHash);
        return true;
      } else {
        console.log(`❌ USDT提现失败: ${withdrawal.amountUSDT} USDT`);
        await this.updateWithdrawalStatus(withdrawal.id, 'failed', null, '区块链交易失败');
        return false;
      }
    } catch (error) {
      console.error('❌ 处理USDT提现时出错:', error);
      await this.updateWithdrawalStatus(withdrawal.id, 'failed', null, error.message);
      return false;
    }
  },

  // 更新提现状态
  async updateWithdrawalStatus(withdrawalId, status, txHash = null, errorMessage = null) {
    try {
      const updateData: any = {
        status,
        processedAt: new Date()
      };

      if (txHash) updateData.txHash = txHash;
      if (errorMessage) updateData.errorMessage = errorMessage;

      await strapi.entityService.update('api::usdt-withdraw.usdt-withdraw' as any, withdrawalId, {
        data: updateData
      });

      console.log(`📝 更新USDT提现状态: ${withdrawalId} -> ${status}`);
    } catch (error) {
      console.error('❌ 更新提现状态时出错:', error);
    }
  },

  // 获取USDT提现统计
  async getWithdrawalStats() {
    try {
      const stats = await strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw' as any, {
        filters: {},
        fields: ['status', 'amountUSDT']
      });

      const total = stats.length;
      const pending = stats.filter(w => w.status === 'pending').length;
      const processing = stats.filter(w => w.status === 'processing').length;
      const success = stats.filter(w => w.status === 'success').length;
      const failed = stats.filter(w => w.status === 'failed').length;
      const totalAmount = stats.reduce((sum, w) => sum + parseFloat(w.amountUSDT), 0);

      return {
        total,
        pending,
        processing,
        success,
        failed,
        totalAmount
      };
    } catch (error) {
      console.error('❌ 获取USDT提现统计时出错:', error);
      return null;
    }
  }
}; 