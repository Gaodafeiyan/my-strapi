/**
 * wallet-balance recharge routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/wallet-balances/recharge-usdt',   // 仅保留业务路径
      handler: 'wallet-balance.rechargeUSDT',  // 其余 config 整块删除
    },
  ],
}; 