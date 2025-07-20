/**
 * wallet routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/wallet/auth/invite-register',
      handler: 'wallet.inviteRegister',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
}; 