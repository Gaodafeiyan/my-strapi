/**
 * wallet-balance recharge routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/wallet-balances/deposit-address',
      handler: 'wallet-balance.getDepositAddress',
    },
  ],
}; 