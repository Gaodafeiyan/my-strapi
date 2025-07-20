/**
 * deposit-address service
 */

import { factories } from '@strapi/strapi';
import { ethers } from 'ethers';

export default factories.createCoreService(
  'api::deposit-address.deposit-address' as any,
  ({ strapi }) => ({
    async generate(userId: number) {
      try {
        // 1. 从环境变量读取「项目方总助记词」
        const MNEMONIC = process.env.HD_MNEMONIC;
        if (!MNEMONIC) {
          // 如果没有助记词，使用默认地址
          console.log('HD_MNEMONIC not set, using default address');
          const defaultAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
          
          return await strapi.entityService.create(
            'api::deposit-address.deposit-address' as any,
            {
              data: {
                address: defaultAddress.toLowerCase(),
                network: 'BSC',
                user: userId,
              },
            }
          );
        }

        // 2. 根据 userId 派生第 N 条路径
        const hdRoot = ethers.HDNodeWallet.fromPhrase(MNEMONIC);
        const child = hdRoot.derivePath(`m/44'/60'/0'/0/${userId}`);

        // 3. 把地址写入 deposit-address content‑type
        return await strapi.entityService.create(
          'api::deposit-address.deposit-address' as any,
          {
            data: {
              address: child.address.toLowerCase(),
              network: 'BSC',
              user: userId,
            },
          }
        );
      } catch (error) {
        console.error('Error generating address:', error);
        // 使用默认地址作为后备
        const defaultAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        
        return await strapi.entityService.create(
          'api::deposit-address.deposit-address' as any,
          {
            data: {
              address: defaultAddress.toLowerCase(),
              network: 'BSC',
              user: userId,
            },
          }
        );
      }
    },

    /** 取当前登录用户的充值地址，没有就派生一个再存 */
    async getOrCreate(userId: number) {
      try {
        const R = strapi.db.query('api::deposit-address.deposit-address');
        let rec = await R.findOne({ where: { user: userId } });
        if (!rec) {
          rec = await (this as any).generate(userId);
        }
        return rec;
      } catch (error) {
        console.error('Error in getOrCreate:', error);
        throw error;
      }
    },
  })
); 