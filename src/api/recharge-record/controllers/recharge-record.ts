/**
 * recharge-record controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::recharge-record.recharge-record' as any, ({ strapi }) => ({
  // 获取用户的充值记录
  async getUserRecharges(ctx) {
    try {
      const userId = ctx.state.user.id;
      const { page = 1, pageSize = 10, status } = ctx.query;

      const filters: any = {
        user: userId
      };

      if (status) {
        filters.status = status;
      }

      const recharges = await strapi.entityService.findMany('api::recharge-record.recharge-record' as any, {
        filters,
        sort: { createdAt: 'desc' },
        populate: ['user'],
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });

      ctx.body = {
        success: true,
        data: recharges
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 管理员获取所有充值记录
  async getAllRecharges(ctx) {
    try {
      const { page = 1, pageSize = 20, status, user } = ctx.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (user) filters.user = user;

      const recharges = await strapi.entityService.findMany('api::recharge-record.recharge-record' as any, {
        filters,
        sort: { createdAt: 'desc' },
        populate: ['user'],
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });

      ctx.body = {
        success: true,
        data: recharges
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 获取充值统计
  async getRechargeStats(ctx) {
    try {
      const { userId } = ctx.query;
      const filters: any = {};
      
      if (userId) {
        filters.user = userId;
      }

      const recharges = await strapi.entityService.findMany('api::recharge-record.recharge-record' as any, {
        filters,
        fields: ['amount', 'status', 'createdAt']
      }) as any[];

      const total = recharges.length;
      const confirmed = recharges.filter(r => r.status === 'confirmed').length;
      const pending = recharges.filter(r => r.status === 'pending').length;
      const failed = recharges.filter(r => r.status === 'failed').length;
      const totalAmount = recharges.reduce((sum, r) => sum + parseFloat(r.amount), 0);

      ctx.body = {
        success: true,
        data: {
          total,
          confirmed,
          pending,
          failed,
          totalAmount
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  // 手动确认充值
  async confirmRecharge(ctx) {
    try {
      const { id } = ctx.params;
      const { status, txHash } = ctx.request.body;

      const recharge = await strapi.entityService.findOne('api::recharge-record.recharge-record' as any, id);

      if (!recharge) {
        return ctx.notFound('充值记录不存在');
      }

      const updateData: any = {
        status,
        confirmedAt: new Date()
      };

      if (txHash) updateData.txHash = txHash;

      const updatedRecharge = await strapi.entityService.update('api::recharge-record.recharge-record' as any, id, {
        data: updateData
      });

      // 如果确认充值，更新用户余额
      if (status === 'confirmed') {
        const userBalance = await strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
          filters: {
            user: recharge.user.id
          }
        }) as any[];

        if (userBalance.length > 0) {
          const balance = userBalance[0];
          await strapi.entityService.update('api::wallet-balance.wallet-balance' as any, balance.id, {
            data: {
              usdtBalance: parseFloat(balance.usdtBalance) + parseFloat(recharge.amount)
            }
          });
        } else {
          // 创建用户钱包余额记录
          await strapi.entityService.create('api::wallet-balance.wallet-balance' as any, {
            data: {
              user: recharge.user.id,
              usdtBalance: parseFloat(recharge.amount),
              aiTokenBalance: 0
            }
          });
        }
      }

      ctx.body = {
        success: true,
        message: '充值状态已更新',
        data: updatedRecharge
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
})); 