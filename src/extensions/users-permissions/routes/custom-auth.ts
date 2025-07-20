/**
 * custom auth routes for users-permissions
 */

export default [
  {
    method: 'POST',
    path: '/api/wallet/auth/invite-register',
    handler: 'auth.inviteRegister',
    config: {
      auth: false,
      policies: [],
      middlewares: []
    }
  }
]; 