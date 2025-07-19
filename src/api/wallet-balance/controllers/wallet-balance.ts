/**
 * wallet-balance controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::wallet-balance.wallet-balance' as any, ({ strapi }) => ({
  // 重写find方法，只返回当前用户的余额
  async find(ctx) {
    try {
      // 检查用户是否已认证
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未认证');
      }

      const userId = ctx.state.user.id;

      // 查找用户的钱包余额
      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        },
        populate: ['user']
      }) as any[];

      if (balance.length === 0) {
        // 创建默认钱包余额
        const newBalance = await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            user: userId,
            usdtBalance: 0,
            aiTokenBalance: 0
          }
        });

        ctx.body = {
          success: true,
          data: [newBalance]
        };
      } else {
        ctx.body = {
          success: true,
          data: balance
        };
      }
    } catch (error) {
      console.error('find error:', error);
      ctx.throw(500, error.message);
    }
  },

  // 重写findOne方法，确保用户只能访问自己的余额
  async findOne(ctx) {
    try {
      // 检查用户是否已认证
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未认证');
      }

      const userId = ctx.state.user.id;
      const { id } = ctx.params;

      const balance = await strapi.entityService.findOne('api::wallet-balance.wallet-balance' as any, id, {
        populate: ['user']
      }) as any;

      if (!balance) {
        return ctx.notFound('钱包余额不存在');
      }

      // 检查是否是用户自己的余额
      if (balance.user?.id !== userId) {
        return ctx.forbidden('无权访问此钱包余额');
      }

      ctx.body = {
        success: true,
        data: balance
      };
    } catch (error) {
      console.error('findOne error:', error);
      ctx.throw(500, error.message);
    }
  },

  // 更新用户余额
  async updateUserBalance(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { usdtBalance, aiTokenBalance } = ctx.request.body;

      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      }) as any[];

      if (balance.length === 0) {
        return ctx.notFound('用户钱包余额不存在');
      }

      const updateData: any = {};
      if (usdtBalance !== undefined) updateData.usdtBalance = parseFloat(usdtBalance);
      if (aiTokenBalance !== undefined) updateData.aiTokenBalance = parseFloat(aiTokenBalance);

      const updatedBalance = await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, balance[0].id, {
        data: updateData
      });

      ctx.body = {
        success: true,
        message: '钱包余额已更新',
        data: updatedBalance
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取充值地址和二维码
  async getRechargeAddress(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount, fromAddress } = ctx.request.body;

      if (!amount || parseFloat(amount) <= 0) {
        return ctx.badRequest('充值金额必须大于0');
      }

      if (!fromAddress) {
        return ctx.badRequest('请提供发送地址');
      }

      // 项目方钱包地址
      const projectWalletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

      // 创建充值记录
      const BlockchainListener = require('../services/blockchain-listener');
      const listener = new BlockchainListener();
      const rechargeRecord = await listener.createRechargeRecord(userId, amount, fromAddress);

      ctx.body = {
        success: true,
        message: '充值地址已生成',
        data: {
          rechargeId: rechargeRecord.id,
          projectWalletAddress: projectWalletAddress,
          amount: amount,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${projectWalletAddress}`,
          status: 'pending',
          message: '请转账到项目方钱包，系统将自动检测到账情况'
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取充值地址和二维码
  async getDepositAddress(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      // 从PlatformWallet表获取默认的USDT收款地址
      const platformWallets = await strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
        filters: {
          tokenType: 'USDT',
          chain: 'BSC',
          isActive: true,
          isDefault: true
        },
        sort: { createdAt: 'desc' }
      }) as any[];

      if (platformWallets.length === 0) {
        return ctx.badRequest('未找到可用的收款地址');
      }

      const platformWallet = platformWallets[0];
      
      // 检查是否已有用户专属充值地址
      const existingAddress = await strapi.entityService.findMany('api::deposit-address.deposit-address' as any, {
        filters: {
          user: userId,
          chain: 'BSC'
        }
      }) as any[];

      let depositAddress;
      
      if (existingAddress.length > 0) {
        // 使用现有地址
        depositAddress = existingAddress[0];
      } else {
        // 创建新充值地址记录，使用平台钱包地址
        depositAddress = await strapi.entityService.create('api::deposit-address.deposit-address' as any, {
          data: {
            user: userId,
            address: platformWallet.address,
            chain: 'BSC',
            createdAt: new Date()
          }
        });
      }

      // 使用平台钱包的二维码或生成新的
      let qrCode = platformWallet.qrCode;
      if (!qrCode) {
        qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${platformWallet.address}`;
      }

      ctx.body = {
        success: true,
        data: {
          address: platformWallet.address,
          qrCode: qrCode,
          qrCodeImage: platformWallet.qrCodeImage,
          asset: 'USDT',
          chain: 'BSC',
          walletName: platformWallet.name,
          minAmount: platformWallet.minAmount,
          maxAmount: platformWallet.maxAmount,
          dailyLimit: platformWallet.dailyLimit
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 检查充值状态
  async checkRechargeStatus(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { rechargeId } = ctx.params;

      const BlockchainListener = require('../services/blockchain-listener');
      const listener = new BlockchainListener();
      const record = await listener.checkRechargeStatus(rechargeId);

      if (!record) {
        return ctx.notFound('充值记录不存在');
      }

      // 检查是否是用户自己的充值记录
      if (record.user.id !== userId) {
        return ctx.forbidden('无权查看此充值记录');
      }

      ctx.body = {
        success: true,
        data: {
          id: record.id,
          amount: record.amount,
          status: record.status,
          txHash: record.txHash,
          confirmedAt: record.confirmedAt,
          message: record.status === 'confirmed' ? '充值成功！' : '等待到账中...'
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 旧的充值方法（保留兼容性）
  async rechargeUSDT(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount } = ctx.request.body;

      if (!amount || parseFloat(amount) <= 0) {
        return ctx.badRequest('充值金额必须大于0');
      }

      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      }) as any[];

      if (balance.length === 0) {
        // 创建新钱包余额
        const newBalance = await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
          data: {
            user: userId,
            usdtBalance: parseFloat(amount),
            aiTokenBalance: 0
          }
        });

        ctx.body = {
          success: true,
          message: 'USDT充值成功',
          data: newBalance
        };
      } else {
        // 更新现有余额
        const currentBalance = balance[0];
        const updatedBalance = await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, currentBalance.id, {
          data: {
            usdtBalance: parseFloat(currentBalance.usdtBalance) + parseFloat(amount)
          }
        });

        ctx.body = {
          success: true,
          message: 'USDT充值成功',
          data: updatedBalance
        };
      }
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 提现申请API
  async withdrawUSDT(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { amount, toAddress } = ctx.request.body;

      // 验证输入
      if (!amount || parseFloat(amount) <= 0) {
        return ctx.badRequest('提现金额必须大于0');
      }

      if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
        return ctx.badRequest('请提供有效的BEP-20地址');
      }

      // 检查用户余额
      const balance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: userId
        }
      }) as any[];

      if (balance.length === 0 || parseFloat(balance[0].usdtBalance || 0) < parseFloat(amount)) {
        return ctx.badRequest('余额不足');
      }

      // 冻结余额
      const currentBalance = balance[0];
      const newBalance = parseFloat(currentBalance.usdtBalance || 0) - parseFloat(amount);
      
      await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, currentBalance.id, {
        data: {
          usdtBalance: newBalance.toString()
        }
      });

      // 创建提现记录
      const withdrawRecord = await strapi.entityService.create('api::usdt-withdraw.usdt-withdraw' as any, {
        data: {
          user: userId,
          amount: amount,
          toAddress: toAddress.toLowerCase(),
          status: 'pending',
          asset: 'USDT',
          chain: 'BSC',
          createdAt: new Date()
        }
      });

      // 创建钱包交易记录
      const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          user_id: userId,
          tx_type: 'withdraw',
          direction: 'out',
          amount: amount,
          to_address: toAddress.toLowerCase(),
          status: 'pending',
          asset: 'USDT',
          chain: 'BSC',
          created_at: new Date()
        }
      });

      const result = { withdrawRecord, walletTx };

      // 发送Socket通知
      console.log(`📡 Socket通知: withdraw:${userId} - 提现申请已提交 ${amount} USDT`);

      ctx.body = {
        success: true,
        message: '提现申请已提交',
        data: {
          withdrawId: result.withdrawRecord.id,
          amount: amount,
          toAddress: toAddress,
          status: 'pending'
        }
      };

    } catch (error) {
      ctx.throw(500, error.message);
    }
  },




  // 测试认证
  async testAuth(ctx) {
    try {
      console.log('testAuth called');
      console.log('ctx.state.user:', ctx.state.user);
      console.log('ctx.state.user.id:', ctx.state.user?.id);
      
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized('用户未认证');
      }

      ctx.body = {
        success: true,
        message: '认证成功',
        user: {
          id: ctx.state.user.id,
          username: ctx.state.user.username
        }
      };
    } catch (error) {
      console.error('testAuth error:', error);
      ctx.throw(500, error.message);
    }
  },

  // 获取所有用户余额（管理员）
  async getAllBalances(ctx) {
    try {
      const { page = 1, pageSize = 20, user } = ctx.query;

      const filters: any = {};
      if (user) filters.user = user;

      const balances = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters,
        sort: { updatedAt: 'desc' },
        populate: ['user'],
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });

      ctx.body = {
        success: true,
        data: balances
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 