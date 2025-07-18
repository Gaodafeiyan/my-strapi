/**
 * withdraw-processor service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::withdraw-request.withdraw-request' as any, ({ strapi }) => ({
  // 处理待处理的提现请求
  async processPendingWithdrawals() {
    try {
      console.log('💸 开始处理待处理的提现请求...');
      
      // 获取所有待处理的提现请求
      const pendingWithdrawals = await strapi.entityService.findMany('api::withdraw-request.withdraw-request' as any, {
        filters: {
          status: 'pending'
        },
        populate: ['user']
      });

      if (!pendingWithdrawals || pendingWithdrawals.length === 0) {
        console.log('ℹ️ 没有待处理的提现请求');
        return;
      }

      console.log(`📋 找到 ${pendingWithdrawals.length} 个待处理的提现请求`);

      for (const withdrawal of pendingWithdrawals as any[]) {
        await this.processWithdrawal(withdrawal);
      }

      console.log('✅ 提现处理完成');
    } catch (error) {
      console.error('❌ 提现处理失败:', error);
    }
  },

  // 处理单个提现请求
  async processWithdrawal(withdrawal: any) {
    try {
      console.log(`🔄 处理提现请求 ID: ${withdrawal.id}, 用户: ${withdrawal.user?.username}, 金额: ${withdrawal.amountUSDT} USDT`);

      // 模拟区块链转账
      const txResult = await this.executeBlockchainTransfer(withdrawal);

      if (txResult.success) {
        // 更新提现请求状态为成功
        await strapi.entityService.update('api::withdraw-request.withdraw-request' as any, withdrawal.id, {
          data: {
            status: 'success',
            txHash: txResult.txHash,
            processedAt: new Date()
          }
        });

        // 更新对应的钱包交易记录
        const walletTx = await strapi.entityService.findMany('api::wallet-tx.wallet-tx' as any, {
          filters: {
            user: withdrawal.user.id,
            txType: 'withdraw',
            walletStatus: 'pending'
          }
        });

        if (walletTx && walletTx.length > 0) {
          await strapi.entityService.update('api::wallet-tx.wallet-tx' as any, walletTx[0].id, {
            data: {
              walletStatus: 'confirmed',
              txHash: txResult.txHash
            }
          });
        }

        console.log(`✅ 提现成功: 用户 ${withdrawal.user?.username}, 交易哈希: ${txResult.txHash}`);
      } else {
        // 更新提现请求状态为失败
        await strapi.entityService.update('api::withdraw-request.withdraw-request' as any, withdrawal.id, {
          data: {
            status: 'failed',
            errorMessage: txResult.error,
            processedAt: new Date()
          }
        });

        // 解冻余额（失败时退回）
        await this.unfreezeBalance(withdrawal.user.id, withdrawal.amountUSDT);

        console.log(`❌ 提现失败: 用户 ${withdrawal.user?.username}, 错误: ${txResult.error}`);
      }
    } catch (error) {
      console.error(`❌ 处理提现请求失败 ID: ${withdrawal.id}:`, error);
      
      // 更新状态为失败
      await strapi.entityService.update('api::withdraw-request.withdraw-request' as any, withdrawal.id, {
        data: {
          status: 'failed',
          errorMessage: error.message,
          processedAt: new Date()
        }
      });
    }
  },

  // 模拟区块链转账（实际项目中替换为真实转账）
  async executeBlockchainTransfer(withdrawal: any) {
    try {
      // 模拟转账延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟成功率 90%
      const success = Math.random() > 0.1;

      if (success) {
        const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
        return {
          success: true,
          txHash: txHash
        };
      } else {
        return {
          success: false,
          error: 'Insufficient gas fee'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 解冻余额（提现失败时退回）
  async unfreezeBalance(userId: number, amount: number) {
    try {
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: userId }
      });

      if (walletBalance && walletBalance.length > 0) {
        const currentBalance = walletBalance[0].amount;
        const fee = 0.01; // 固定手续费
        const totalRefund = amount + fee;

        await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
          data: {
            amount: currentBalance + totalRefund
          }
        });

        console.log(`💰 余额解冻: 用户 ${userId}, 退回 ${totalRefund} USDT`);
      }
    } catch (error) {
      console.error('❌ 解冻余额失败:', error);
    }
  },

  // 获取提现统计
  async getWithdrawalStats() {
    try {
      const stats = {
        pending: 0,
        success: 0,
        failed: 0,
        total: 0
      };

      const allWithdrawals = await strapi.entityService.findMany('api::withdraw-request.withdraw-request' as any, {});
      
      for (const withdrawal of allWithdrawals as any[]) {
        stats.total++;
        switch (withdrawal.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'success':
            stats.success++;
            break;
          case 'failed':
            stats.failed++;
            break;
        }
      }

      return stats;
    } catch (error) {
      console.error('❌ 获取提现统计失败:', error);
      return null;
    }
  }
})); 