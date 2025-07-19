/**
 * wallet-balance router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wallet-balance.wallet-balance' as any, {
  config: {
    find: {
      auth: { scope: ['api::wallet-balance.wallet-balance'] },
    },
    findOne: {
      auth: { scope: ['api::wallet-balance.wallet-balance'] },
    },
    create: {
      auth: { scope: ['api::wallet-balance.wallet-balance'] },
    },
    update: {
      auth: { scope: ['api::wallet-balance.wallet-balance'] },
    },
  },
}); 