/**
 * AI Token Withdraw Listener Service
 * 监听AI代币提现请求并处理区块链交易
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::ai-token-withdraw.ai-token-withdraw' as any, ({ strapi }) => ({
  // 监听AI代币提现请求
  async listenAiTokenWithdrawals() {
    try {
      console.log('🔍 开始监听AI代币提现请求...');

      // 获取所有待处理的AI代币提现请求
      const pendingWithdrawals = await strapi.entityService.findMany('api::ai-token-withdraw.ai-token-withdraw' as any, {
        filters: {
          status: 'pending'
        },
        populate: ['user']
      }) as any[];

      console.log(`📊 找到 ${pendingWithdrawals.length} 个待处理的AI代币提现请求`);

      for (const withdrawal of pendingWithdrawals) {
        try {
          console.log(`🔄 处理AI代币提现请求 ID: ${withdrawal.id}`);
          
          // 更新状态为处理中
          await strapi.entityService.update('api::ai-token-withdraw.ai-token-withdraw' as any, withdrawal.id, {
            data: {
              status: 'processing'
            }
          });

          // 模拟区块链交易处理
          const success = await this.processAiTokenWithdrawal(withdrawal);
          
          if (success) {
            // 更新状态为成功
            await strapi.entityService.update('api::ai-token-withdraw.ai-token-withdraw' as any, withdrawal.id, {
              data: {
                status: 'success',
                txHash: `0x${Math.random().toString(16).substr(2, 64)}` // 模拟交易哈希
              }
            });

            // 更新钱包交易记录
            const walletTx = await strapi.entityService.findMany('api::wallet-tx.wallet-tx' as any, {
              filters: {
                user: withdrawal.user.id,
                txType: 'aiToken',
                direction: 'out',
                walletStatus: 'pending'
              },
              sort: { createdAt: 'desc' },
              limit: 1
            });

            if (walletTx.length > 0) {
              await strapi.entityService.update('api::wallet-tx.wallet-tx' as any, walletTx[0].id, {
                data: {
                  walletStatus: 'success',
                  txHash: `0x${Math.random().toString(16).substr(2, 64)}`
                }
              });
            }

            console.log(`✅ AI代币提现请求 ${withdrawal.id} 处理成功`);
          } else {
            // 更新状态为失败
            await strapi.entityService.update('api::ai-token-withdraw.ai-token-withdraw' as any, withdrawal.id, {
              data: {
                status: 'fail'
              }
            });

            // 更新钱包交易记录
            const walletTx = await strapi.entityService.findMany('api::wallet-tx.wallet-tx' as any, {
              filters: {
                user: withdrawal.user.id,
                txType: 'aiToken',
                direction: 'out',
                walletStatus: 'pending'
              },
              sort: { createdAt: 'desc' },
              limit: 1
            });

            if (walletTx.length > 0) {
              await strapi.entityService.update('api::wallet-tx.wallet-tx' as any, walletTx[0].id, {
                data: {
                  walletStatus: 'fail'
                }
              });
            }

            // 退还AI代币余额
            const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
              filters: { user: withdrawal.user.id }
            });

            if (walletBalance.length > 0) {
              const currentBalance = walletBalance[0].aiTokenBalance || 0;
              const refundAmount = parseFloat(withdrawal.amountAI) + 0.01; // 退还金额+手续费
              
              await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
                data: {
                  aiTokenBalance: currentBalance + refundAmount
                }
              });
            }

            console.log(`❌ AI代币提现请求 ${withdrawal.id} 处理失败`);
          }

        } catch (error) {
          console.error(`❌ 处理AI代币提现请求 ${withdrawal.id} 时出错:`, error);
          
          // 更新状态为失败
          await strapi.entityService.update('api::ai-token-withdraw.ai-token-withdraw' as any, withdrawal.id, {
            data: {
              status: 'fail'
            }
          });
        }
      }

      console.log('✅ AI代币提现监听完成');

    } catch (error) {
      console.error('❌ AI代币提现监听服务出错:', error);
    }
  },

  // 处理AI代币提现
  async processAiTokenWithdrawal(withdrawal) {
    try {
      console.log(`🔄 处理AI代币提现: ${withdrawal.amountAI} AI -> ${withdrawal.toAddress}`);
      
      // 获取平台AI代币钱包
      const platformWallet = await strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
        filters: {
          isActive: true,
          tokenType: 'AI_TOKEN',
          chain: 'BSC'
        },
        sort: { balance: 'desc' },
        limit: 1
      });

      if (!platformWallet || platformWallet.length === 0) {
        console.error('❌ 没有找到可用的平台AI代币钱包');
        return false;
      }

      const wallet = platformWallet[0];
      console.log(`🏦 使用平台钱包: ${wallet.address}`);

      // 检查平台钱包余额
      if (wallet.balance < parseFloat(withdrawal.amountAI)) {
        console.error(`❌ 平台钱包余额不足: ${wallet.balance} AI < ${withdrawal.amountAI} AI`);
        return false;
      }

      // 调用BSC转账服务
      const bscTransferService = require('./bsc-transfer-service');
      const transferResult = await bscTransferService.transferAiTokens(
        withdrawal.toAddress, 
        parseFloat(withdrawal.amountAI)
      );
      
      if (transferResult.success) {
        // 更新平台钱包余额
        await strapi.entityService.update('api::platform-wallet.platform-wallet' as any, wallet.id, {
          data: {
            balance: wallet.balance - parseFloat(withdrawal.amountAI),
            lastUpdated: new Date()
          }
        });

        console.log(`✅ BSC AI代币提现成功: ${withdrawal.amountAI} AI`);
        console.log(`📤 从平台钱包: ${wallet.address}`);
        console.log(`📥 到用户地址: ${withdrawal.toAddress}`);
        console.log(`🔗 交易哈希: ${transferResult.txHash}`);
        return true;
      } else {
        console.log(`❌ BSC AI代币提现失败: ${withdrawal.amountAI} AI`);
        console.log(`❌ 错误信息: ${transferResult.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ 处理AI代币提现时出错:', error);
      return false;
    }
  },

  // 启动AI代币提现监听
  startAiTokenWithdrawListener() {
    console.log('🚀 启动AI代币提现监听服务...');
    
    // 每30秒检查一次
    setInterval(async () => {
      await this.listenAiTokenWithdrawals();
    }, 30000);
  }
})); 