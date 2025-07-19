/**
 * usdt-withdraw controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::usdt-withdraw.usdt-withdraw' as any, ({ strapi }) => ({
  async createWithdraw(ctx) {
    try {
      const result = await strapi.service('api::usdt-withdraw.usdt-withdraw').createWithdraw(ctx);
      return ctx.send({
        success: true,
        data: result,
        message: '提现请求已提交，请等待处理'
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async getMyWithdraws(ctx) {
    try {
      const userId = ctx.state.user.id;
      const withdraws = await strapi.service('api::usdt-withdraw.usdt-withdraw').getWithdrawHistory(userId);
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
      const withdraw = await strapi.query('api::usdt-withdraw.usdt-withdraw').findOne({
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