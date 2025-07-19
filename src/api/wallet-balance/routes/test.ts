/**
 * wallet-balance test routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/wallet-balances/test',
      handler: 'wallet-balance.testAuth',
    },
  ],
}; 