/**
 * custom-withdraw router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'POST',
      path: '/wallet/withdraw',
      handler: 'withdraw.withdraw',
      config: {
        auth: false,
        policies: ['auth-policy'],
        middlewares: []
      }
    }
  ]
}; 