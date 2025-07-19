/**
 * wallet-balance recharge routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/api/wallet-balances/recharge-usdt',
      handler: 'wallet-balance.rechargeUSDT',
      config: {
        auth: { scope: ['api::wallet-balance.wallet-balance'] },
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 