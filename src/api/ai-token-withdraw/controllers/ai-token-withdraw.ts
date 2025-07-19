/**
 * ai-token-withdraw controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::ai-token-withdraw.ai-token-withdraw' as any, ({ strapi }) => ({
  async createWithdraw(ctx) {
    try {
      const result = await strapi.service('api::ai-token-withdraw.ai-token-withdraw').createWithdraw(ctx);
      return ctx.send({
        success: true,
        data: result,
        message: 'AI代币提现请求已提交，请等待处理'
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getMyWithdraws(ctx) {
    try {
      const userId = ctx.state.user.id;
      const withdraws = await strapi.service('api::ai-token-withdraw.ai-token-withdraw').getWithdrawHistory(userId);
      return ctx.send({
        success: true,
        data: withdraws
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getWithdrawStatus(ctx) {
    try {
      const { id } = ctx.params;
      const withdraw = await strapi.query('api::ai-token-withdraw.ai-token-withdraw').findOne({
        where: { id },
        populate: ['user']
      });
      
      if (!withdraw) {
        return ctx.notFound('提现记录不存在');
      }

      return ctx.send({
        success: true,
        data: withdraw
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
})); 