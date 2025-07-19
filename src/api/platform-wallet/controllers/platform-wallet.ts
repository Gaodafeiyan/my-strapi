/**
 * platform-wallet controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::platform-wallet.platform-wallet' as any, ({ strapi }) => ({
  // 获取活跃的平台钱包
  async getActiveWallets(ctx) {
    try {
      const wallets = await strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
        filters: {
          isActive: true
        },
        fields: ['id', 'name', 'address', 'chain', 'tokenType', 'balance', 'lastUpdated'],
        sort: { createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: wallets
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 更新钱包余额
  async updateWalletBalance(ctx) {
    try {
      const { walletId } = ctx.params;
      const { balance } = ctx.request.body;

      const wallet = await strapi.entityService.update('api::platform-wallet.platform-wallet' as any, walletId, {
        data: {
          balance: balance,
          lastUpdated: new Date()
        }
      });

      ctx.body = {
        success: true,
        data: wallet
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取指定类型的活跃钱包
  async getWalletByType(ctx) {
    try {
      const { tokenType, chain } = ctx.query;

      const filters: any = {
        isActive: true
      };

      if (tokenType) {
        filters.tokenType = tokenType;
      }

      if (chain) {
        filters.chain = chain;
      }

      const wallet = await strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
        filters: filters,
        sort: { balance: 'desc' },
        limit: 1
      });

      ctx.body = {
        success: true,
        data: wallet.length > 0 ? wallet[0] : null
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 检查钱包余额
  async checkWalletBalance(ctx) {
    try {
      const { walletId } = ctx.params;

      const wallet = await strapi.entityService.findOne('api::platform-wallet.platform-wallet' as any, walletId);

      if (!wallet) {
        return ctx.notFound('Wallet not found');
      }

      // 这里可以添加实际的区块链余额检查逻辑
      // 暂时返回数据库中的余额
      ctx.body = {
        success: true,
        data: {
          walletId: wallet.id,
          address: wallet.address,
          balance: wallet.balance,
          tokenType: wallet.tokenType,
          chain: wallet.chain,
          lastUpdated: wallet.lastUpdated
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 