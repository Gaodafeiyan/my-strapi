/**
 * platform-wallet controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::platform-wallet.platform-wallet' as any, ({ strapi }) => ({
  // 重写更新方法，添加地址变更监听
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      
      // 获取原钱包信息
      const originalWallet = await strapi.entityService.findOne('api::platform-wallet.platform-wallet' as any, id);
      
      // 执行更新
      const result = await strapi.entityService.update('api::platform-wallet.platform-wallet' as any, id, {
        data: {
          ...data,
          lastUpdated: new Date()
        }
      });
      
      // 检查地址是否变更
      if (originalWallet && data.address && originalWallet.address !== data.address) {
        console.log(`🔄 钱包地址已变更: ${originalWallet.address} → ${data.address}`);
        
        // 记录地址变更日志
        await strapi.entityService.create('api::blockchain-log.blockchain-log' as any, {
          data: {
            chain: result.chain,
            logType: 'info',
            message: `钱包地址已变更: ${originalWallet.address} → ${data.address}`,
            fromAddress: originalWallet.address,
            toAddress: data.address,
            status: 'success',
            processedAt: new Date()
          }
        });
        
        // 更新系统监控
        await this.updateSystemMonitor('address_changed', {
          oldAddress: originalWallet.address,
          newAddress: data.address,
          walletName: result.name
        });
      }
      
      ctx.body = {
        success: true,
        data: result,
        message: '钱包信息已更新'
      };
      
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },
  
  // 获取活跃钱包列表
  async getActiveWallets(ctx) {
    try {
      const wallets = await strapi.entityService.findMany('api::platform-wallet.platform-wallet', {
        filters: {
          isActive: true
        },
        sort: { isDefault: 'desc', createdAt: 'desc' }
      });
      
      ctx.body = {
        success: true,
        data: wallets
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },
  
  // 设置默认钱包
  async setDefault(ctx) {
    try {
      const { id } = ctx.params;
      
      // 先取消所有默认钱包
      await strapi.entityService.updateMany('api::platform-wallet.platform-wallet', {
        filters: { isDefault: true },
        data: { isDefault: false }
      });
      
      // 设置新的默认钱包
      const result = await strapi.entityService.update('api::platform-wallet.platform-wallet', id, {
        data: { isDefault: true }
      });
      
      ctx.body = {
        success: true,
        data: result,
        message: '默认钱包已设置'
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },
  
  // 更新系统监控
  async updateSystemMonitor(eventType: string, data: any) {
    try {
      const monitor = await strapi.entityService.findMany('api::system-monitor.system-monitor', {
        filters: {
          serviceName: 'blockchain_monitor'
        }
      });
      
      if (monitor.length > 0) {
        await strapi.entityService.update('api::system-monitor.system-monitor', monitor[0].id, {
          data: {
            lastRunAt: new Date(),
            config: {
              lastEvent: eventType,
              eventData: data,
              timestamp: new Date().toISOString()
            }
          }
        });
      }
    } catch (error) {
      console.error('更新系统监控失败:', error);
    }
  }
})); 