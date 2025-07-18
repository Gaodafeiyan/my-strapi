/**
 * auth router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'auth.inviteRegister',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
}; 