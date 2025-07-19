/**
 * lottery-spin router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'GET',
      path: '/lottery-spins',
      handler: 'lottery-spin.find',
    },
    {
      method: 'GET',
      path: '/lottery-spins/:id',
      handler: 'lottery-spin.findOne',
    },
    {
      method: 'POST',
      path: '/lottery/spin',
      handler: 'lottery-spin.spin',
    },
  ],
}; 