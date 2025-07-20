/**
 * wallet-balance router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wallet-balance.wallet-balance' as any, {
  config: {
    find: {},
    findOne: {},
    create: {},
    update: {},
    delete: {},
  },
  routes: [
    {
      method: 'GET',
      path: '/api/wallet-balance/balance',
      handler: 'wallet-balance.find',
    },
    {
      method: 'POST',
      path: '/api/wallet-balance/recharge',
      handler: 'wallet-balance.rechargeUSDT',
    },
    {
      method: 'POST',
      path: '/api/wallet-balance/withdraw',
      handler: 'wallet-balance.withdrawUSDT',
    },
    {
      method: 'GET',
      path: '/api/wallet-balance/deposit-address',
      handler: 'wallet-balance.getDepositAddress',
    },
    {
      method: 'GET',
      path: '/api/wallet-balance/test-auth',
      handler: 'wallet-balance.testAuth',
    },
  ],
}); 