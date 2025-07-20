/**
 * usdt-withdraw router
 */

import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::usdt-withdraw.usdt-withdraw' as any, {
  only: ['create','find','findOne']   // 视需求裁剪
}); 