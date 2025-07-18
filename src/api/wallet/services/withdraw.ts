/**
 * withdraw service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::wallet.wallet' as any, ({ strapi }) => ({
  async withdraw(payload: {
    userId: number;
    toAddress: string;
    amountUSDT: string;
  }) {
    const { userId, toAddress, amountUSDT } = payload;

    // 验证地址格式
    if (!this.isValidBSCAddress(toAddress)) {
      throw new Error('INVALID_ADDRESS');
    }

    // 验证金额
    const amount = parseFloat(amountUSDT);
    if (amount <= 0 || amount.toString().split('.')[1]?.length > 2) {
      throw new Error('INVALID_AMOUNT');
    }

    // 检查余额
    const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
      filters: { user: userId }
    });

    if (!walletBalance || walletBalance.length === 0) {
      throw new Error('WALLET_NOT_FOUND');
    }

    const balance = walletBalance[0].amount;
    const fee = 0.01; // 固定手续费
    const totalRequired = amount + fee;

    if (balance < totalRequired) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    // 检查当日提现次数限制
    const dailyLimit = parseInt(process.env.DAILY_WITHDRAW_LIMIT || '5');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWithdrawals = await strapi.entityService.findMany('api::withdraw-request.withdraw-request' as any, {
      filters: {
        user: userId,
        createdAt: {
          $gte: today
        }
      }
    });

    if (todayWithdrawals.length >= dailyLimit) {
      throw new Error('DAILY_WITHDRAW_LIMIT_EXCEEDED');
    }

    // 创建提现请求
    const withdrawRequest = await strapi.entityService.create('api::withdraw-request.withdraw-request' as any, {
      data: {
        toAddress,
        amountUSDT: amount,
        status: 'pending',
        user: userId
      }
    });

    // 创建钱包交易记录
    const walletTx = await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
      data: {
        txType: 'withdraw',
        direction: 'out',
        amount: amount,
        walletStatus: 'pending',
        user: userId,
        asset: 1 // USDT asset ID
      }
    });

    // 冻结余额
    await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
      data: {
        amount: balance - totalRequired
      }
    });

    return {
      withdrawRequestId: withdrawRequest.id,
      walletTxId: walletTx.id,
      message: 'Withdrawal request created successfully'
    };
  },

  isValidBSCAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
})); 