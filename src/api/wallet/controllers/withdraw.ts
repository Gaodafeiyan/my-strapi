/**
 * withdraw controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::wallet-balance.wallet-balance' as any, ({ strapi }) => ({
  async withdraw(ctx) {
    try {
      const { toAddress, amountUSDT } = ctx.request.body;
      const userId = ctx.state.user.id;

      // 调用服务处理提现逻辑
      const result = await strapi.service('api::wallet-balance.withdraw').withdraw({
        userId,
        toAddress,
        amountUSDT
      });

      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 