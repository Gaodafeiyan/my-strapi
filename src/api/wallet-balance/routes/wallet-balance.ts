/**
 * wallet-balance router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wallet-balance.wallet-balance' as any, {
  config: {
    find: {
      policies: ['global::only-authenticated'],
    },
    findOne: {
      policies: ['global::only-authenticated'],
    },
    create: {
      policies: ['global::only-authenticated'],
    },
    update: {
      policies: ['global::only-authenticated'],
    },
    delete: {
      policies: ['global::only-authenticated'],
    },
  },
}); 