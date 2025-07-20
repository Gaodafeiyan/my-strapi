/**
 * usdt-withdraw service
 */

import { factories } from '@strapi/strapi';

export default ({ strapi }) => ({
  async request(ctx) {
    const { amountUSDT, toAddress } = ctx.request.body;
    const userId = ctx.state.user.id;

    // 1) 正则简单验址
    if (!/^0x[0-9a-fA-F]{40}$/.test(toAddress)) ctx.throw(400, 'ADDRESS_INVALID');

    // 2) 扣余额
    await strapi.service('api::wallet-balance.wallet-balance')
      .add(userId, '-' + amountUSDT, { txType: 'withdraw', direction: 'out', status: 'pending' });

    // 3) 写申请
    const rec = await strapi.db
      .query('api::usdt-withdraw.usdt-withdraw')
      .create({ data: { amountUSDT, toAddress, status: 'pending', user: userId } });

    ctx.body = { success: true, withdrawId: rec.id };
  },
}); 