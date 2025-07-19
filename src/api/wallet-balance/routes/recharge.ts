/**
 * wallet-balance recharge routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/wallet-balances/recharge-usdt',
      handler: 'wallet-balance.rechargeUSDT',
    },
    {
      method: 'POST',
      path: '/wallet-balances/get-recharge-address',
      handler: 'wallet-balance.getRechargeAddress',
    },
    {
      method: 'GET',
      path: '/wallet-balances/check-recharge-status/:rechargeId',
      handler: 'wallet-balance.checkRechargeStatus',
    },
    {
      method: 'GET',
      path: '/wallet/deposit-address',
      handler: 'wallet-balance.getDepositAddress',
    },
    {
      method: 'POST',
      path: '/wallet/withdraw-usdt',
      handler: 'wallet-balance.withdrawUSDT',
    },
  ],
}; 