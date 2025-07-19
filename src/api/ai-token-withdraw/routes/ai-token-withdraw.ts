/**
 * ai-token-withdraw router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::ai-token-withdraw.ai-token-withdraw' as any, {
  config: {
    find: {
      auth: { scope: ['api::ai-token-withdraw.ai-token-withdraw'] },
    },
    findOne: {
      auth: { scope: ['api::ai-token-withdraw.ai-token-withdraw'] },
    },
    create: {
      auth: { scope: ['api::ai-token-withdraw.ai-token-withdraw'] },
    },
    update: {
      auth: { scope: ['api::ai-token-withdraw.ai-token-withdraw'] },
    },
    delete: {
      auth: { scope: ['api::ai-token-withdraw.ai-token-withdraw'] },
    },
  },
}); 