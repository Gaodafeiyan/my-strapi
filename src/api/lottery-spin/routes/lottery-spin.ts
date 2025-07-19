/**
 * lottery-spin router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'POST',
      path: '/lottery/spin',
      handler: 'lottery-spin.spin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 