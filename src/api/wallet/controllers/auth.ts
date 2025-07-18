/**
 * auth controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::wallet-balance.wallet-balance' as any, ({ strapi }) => ({
  async inviteRegister(ctx) {
    try {
      const { username, email, password, inviteCode } = ctx.request.body;

      // 调用服务处理注册逻辑
      const result = await strapi.service('api::wallet.auth').inviteRegister({
        username,
        email,
        password,
        inviteCode
      });

      ctx.body = result;
    } catch (error) {
      ctx.throw(400, error.message);
    }
  }
})); 