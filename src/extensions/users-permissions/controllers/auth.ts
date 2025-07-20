/**
 * auth controller for users-permissions
 */

import { factories } from '@strapi/strapi';
import validator from '../../../api/wallet/validators/auth';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async inviteRegister(ctx) {
    try {
      const { username, email, password, inviteCode } = ctx.request.body;

      // 验证请求参数
      await validator.validateInviteRegister({
        username,
        email,
        password,
        inviteCode
      });

      // 调用服务处理注册逻辑
      const result = await strapi.service('api::wallet-balance.wallet-balance').inviteRegister({
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