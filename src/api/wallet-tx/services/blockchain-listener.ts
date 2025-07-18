/**
 * blockchain-listener service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::wallet-tx.wallet-tx' as any, ({ strapi }) => ({
  async processDeposits() {
    try {
      // 获取所有充值地址
      const depositAddresses = await strapi.entityService.findMany('api::deposit-address.deposit-address' as any, {
        populate: ['user']
      });

      if (!depositAddresses || depositAddresses.length === 0) {
        return { message: 'No deposit addresses found' };
      }

      const addresses = depositAddresses.map(addr => addr.address);
      
      // 这里应该调用 BSC RPC 获取最新区块和转账事件
      // 简化实现，实际应该使用 web3.js 或 ethers.js
      const latestBlock = await this.getLatestBlock();
      const transferEvents = await this.getTransferEvents(latestBlock, addresses);

      let processedCount = 0;
      for (const event of transferEvents) {
        const processed = await this.processTransferEvent(event);
        if (processed) processedCount++;
      }

      return {
        message: `Processed ${processedCount} deposit events`,
        processedCount
      };
    } catch (error) {
      console.error('Error processing deposits:', error);
      throw error;
    }
  },

  async processTransferEvent(event: any) {
    try {
      // 检查是否已处理过
      const existingTx = await strapi.entityService.findMany('api::wallet-tx.wallet-tx' as any, {
        filters: { txHash: event.txHash }
      });

      if (existingTx && existingTx.length > 0) {
        return false; // 已处理过
      }

      // 查找对应的用户
      const depositAddress = await strapi.entityService.findMany('api::deposit-address.deposit-address' as any, {
        filters: { address: event.to },
        populate: ['user']
      });

      if (!depositAddress || depositAddress.length === 0) {
        return false; // 不是我们的地址
      }

      const user = depositAddress[0].user;
      const amount = event.value / Math.pow(10, 18); // USDT 18位小数

      // 创建钱包交易记录
      await strapi.entityService.create('api::wallet-tx.wallet-tx' as any, {
        data: {
          txType: 'deposit',
          direction: 'in',
          amount: amount,
          walletStatus: 'success',
          txHash: event.txHash,
          user: user.id,
          asset: 1 // USDT asset ID
        }
      });

      // 更新钱包余额
      const walletBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: { user: user.id }
      });

      if (walletBalance && walletBalance.length > 0) {
        await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, walletBalance[0].id, {
          data: {
            amount: walletBalance[0].amount + amount
          }
        });
      }

      // 发送 WebSocket 通知
      await this.sendDepositNotification(user.id, {
        amount,
        txHash: event.txHash
      });

      // 检查大额充值警报
      const alertThreshold = parseFloat(process.env.ALERT_DEPOSIT_USDT || '1000');
      if (amount >= alertThreshold) {
        await this.sendAdminAlert(user.id, amount, event.txHash);
      }

      return true;
    } catch (error) {
      console.error('Error processing transfer event:', error);
      return false;
    }
  },

  async getLatestBlock(): Promise<number> {
    // 这里应该调用 BSC RPC
    // 简化实现
    return 30000000;
  },

  async getTransferEvents(blockNumber: number, addresses: string[]): Promise<any[]> {
    // 这里应该调用 BSC RPC 获取 Transfer 事件
    // 简化实现，返回空数组
    return [];
  },

  async sendDepositNotification(userId: number, payload: any) {
    // 发送 WebSocket 通知
    // 这里应该使用 Socket.io 或其他 WebSocket 库
    console.log(`Deposit notification for user ${userId}:`, payload);
  },

  async sendAdminAlert(userId: number, amount: number, txHash: string) {
    // 发送管理员邮件警报
    // 这里应该使用邮件服务
    console.log(`Large deposit alert: User ${userId}, Amount ${amount}, TX ${txHash}`);
  }
})); 