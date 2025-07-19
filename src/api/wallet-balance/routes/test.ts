/**
 * wallet-balance test routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/api/wallet-balances/test',
      handler: 'wallet-balance.testAuth',
      config: {
        auth: { scope: ['api::wallet-balance.wallet-balance'] },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 