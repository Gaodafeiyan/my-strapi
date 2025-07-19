const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::platform-wallet.platform-wallet', ({ strapi }) => ({
  // 监听地址变更
  async onAddressChange(oldAddress, newAddress, walletName) {
    try {
      console.log(`🔄 钱包地址已变更: ${oldAddress} → ${newAddress}`);
      
      // 记录地址变更日志
      await strapi.entityService.create('api::blockchain-log.blockchain-log', {
        data: {
          chain: 'BSC',
          logType: 'info',
          message: `钱包地址已变更: ${oldAddress} → ${newAddress}`,
          fromAddress: oldAddress,
          toAddress: newAddress,
          status: 'success',
          processedAt: new Date()
        }
      });
      
      // 更新系统监控
      await this.updateSystemMonitor('address_changed', {
        oldAddress,
        newAddress,
        walletName
      });
      
      console.log('✅ 地址变更已记录');
      
    } catch (error) {
      console.error('❌ 记录地址变更失败:', error);
    }
  },
  
  // 更新系统监控
  async updateSystemMonitor(eventType, data) {
    try {
      const monitors = await strapi.entityService.findMany('api::system-monitor.system-monitor', {
        filters: {
          serviceName: 'blockchain_monitor'
        }
      });
      
      if (monitors.length > 0) {
        await strapi.entityService.update('api::system-monitor.system-monitor', monitors[0].id, {
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
  },
  
  // 获取活跃钱包地址列表
  async getActiveWalletAddresses() {
    try {
      const wallets = await strapi.entityService.findMany('api::platform-wallet.platform-wallet', {
        filters: {
          isActive: true
        }
      });
      
      return wallets.map(wallet => wallet.address.toLowerCase());
    } catch (error) {
      console.error('获取活跃钱包地址失败:', error);
      return [];
    }
  },
  
  // 检查地址是否有效
  async validateAddress(address) {
    // 简单的BEP-20地址验证
    const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
    return bep20Regex.test(address);
  }
})); 