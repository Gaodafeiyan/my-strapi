/**
 * wallet-balance service
 */

import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default ({ strapi }) => ({
  /** 原子更新余额并写流水 */
  async add(userId: number, delta: string, tx: Partial<WalletTx>) {
    return strapi.db.transaction(async (trx) => {
      const B = strapi.db.query('api::wallet-balance.wallet-balance').transacting(trx);
      const WT = strapi.db.query('api::wallet-tx.wallet-tx').transacting(trx);

      // 1) 锁余额行
      let bal = await B.findOne({ where: { user: userId }, lock: { mode: 'pessimistic_write' } });
      if (!bal) bal = await B.create({ data: { amount: '0', user: userId } });

      // 2) 计算新余额
      const next = new Decimal(bal.amount).plus(delta);
      if (next.isNegative()) throw new Error('INSUFFICIENT_BALANCE');

      // 3) 持久化
      await B.update({ where: { id: bal.id }, data: { amount: next.toFixed(8) } });
      await WT.create({ data: { ...tx, amount: delta, user: userId, asset: 1 } });
      return next.toFixed(8);
    });
  },
}); 