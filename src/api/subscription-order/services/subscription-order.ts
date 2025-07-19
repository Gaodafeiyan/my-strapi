/**
 * subscription-order service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::subscription-order.subscription-order' as any, ({ strapi }) => ({
  // 注意：邀请返佣逻辑已移至 static-yield.ts 中，在订单完成时触发
})); 