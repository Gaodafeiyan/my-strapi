/**
 * recharge-record router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::recharge-record.recharge-record' as any, {
  config: {
    find: {
      auth: { scope: ['api::recharge-record.recharge-record'] },
    },
    findOne: {
      auth: { scope: ['api::recharge-record.recharge-record'] },
    },
    create: {
      auth: { scope: ['api::recharge-record.recharge-record'] },
    },
    update: {
      auth: { scope: ['api::recharge-record.recharge-record'] },
    },
    delete: {
      auth: { scope: ['api::recharge-record.recharge-record'] },
    },
  },
}); 