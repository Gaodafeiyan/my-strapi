/**
 * platform-wallet router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::platform-wallet.platform-wallet' as any, {
  config: {
    find: {
      policies: ['plugin::users-permissions.isAuthenticated'],
    },
    findOne: {
      policies: ['plugin::users-permissions.isAuthenticated'],
    },
    create: {
      policies: ['plugin::users-permissions.isAuthenticated'],
    },
    update: {
      policies: ['plugin::users-permissions.isAuthenticated'],
    },
    delete: {
      policies: ['plugin::users-permissions.isAuthenticated'],
    },
  },
}); 