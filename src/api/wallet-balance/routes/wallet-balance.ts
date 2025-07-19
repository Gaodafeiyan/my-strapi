/**
 * wallet-balance router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wallet-balance.wallet-balance' as any, {
  config: {
    find: {
      policies: ['global::isAuthenticated'],
    },
    findOne: {
      policies: ['global::isAuthenticated'],
    },
    create: {
      policies: ['global::isAuthenticated'],
    },
    update: {
      policies: ['global::isAuthenticated'],
    },
    delete: {
      policies: ['global::isAuthenticated'],
    },
  },
}); 