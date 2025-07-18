/**
 * custom-register router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/invite-register',
      handler: 'invite-register.inviteRegister',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
}; 