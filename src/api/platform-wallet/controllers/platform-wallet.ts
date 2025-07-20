/**
 * platform-wallet controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::platform-wallet.platform-wallet' as any, ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    
    const result = await strapi.entityService.update('api::platform-wallet.platform-wallet' as any, id, {
      data
    });
    
    return { data: result };
  },
  
  async getActiveWallets(ctx) {
    const wallets = await strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
      filters: {
        isActive: true
      }
    });
    
    return { data: wallets };
  },
  
  async setDefault(ctx) {
    const { id } = ctx.params;
    
    // 先重置所有钱包为非默认
    const allWallets = await strapi.entityService.findMany('api::platform-wallet.platform-wallet' as any, {
      filters: {}
    });
    
    for (const wallet of allWallets as any[]) {
      await strapi.entityService.update('api::platform-wallet.platform-wallet' as any, wallet.id, {
        data: { isDefault: false }
      });
    }
    
    // 设置指定钱包为默认
    const result = await strapi.entityService.update('api::platform-wallet.platform-wallet' as any, id, {
      data: { isDefault: true }
    });
    
    return { data: result };
  }
})); 