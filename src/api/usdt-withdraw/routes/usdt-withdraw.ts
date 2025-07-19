/**
 * usdt-withdraw router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::usdt-withdraw.usdt-withdraw' as any, {
  config: {
    find: {
      auth: { scope: ['api::usdt-withdraw.usdt-withdraw'] },
    },
    findOne: {
      auth: { scope: ['api::usdt-withdraw.usdt-withdraw'] },
    },
    create: {
      auth: { scope: ['api::usdt-withdraw.usdt-withdraw'] },
    },
    update: {
      auth: { scope: ['api::usdt-withdraw.usdt-withdraw'] },
    },
    delete: {
      auth: { scope: ['api::usdt-withdraw.usdt-withdraw'] },
    },
  },
}); 