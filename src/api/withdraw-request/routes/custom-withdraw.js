/**
 * custom-withdraw router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/wallet/withdraw',
      handler: 'withdraw-request.customWithdraw',
      config: {
        auth: {
          scope: ['authenticated']
        },
        policies: ['global::only-authenticated'],
        middlewares: []
      }
    }
  ]
}; 