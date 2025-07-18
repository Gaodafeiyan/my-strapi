/**
 * wallet controller
 */

export default ({ strapi }) => ({
  async withdraw(ctx) {
    try {
      // 检查认证
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }
      
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
}); 