/**
 * withdraw router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/wallet/withdraw',
      handler: 'wallet.withdraw',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
}; 