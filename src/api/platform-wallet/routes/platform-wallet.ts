/**
 * platform-wallet router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::platform-wallet.platform-wallet' as any, {
  config: {
    find: {
      auth: { scope: ['api::platform-wallet.platform-wallet'] },
    },
    findOne: {
      auth: { scope: ['api::platform-wallet.platform-wallet'] },
    },
    create: {
      auth: { scope: ['api::platform-wallet.platform-wallet'] },
    },
    update: {
      auth: { scope: ['api::platform-wallet.platform-wallet'] },
    },
    delete: {
      auth: { scope: ['api::platform-wallet.platform-wallet'] },
    },
  },
}); 