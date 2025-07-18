/**
 * withdraw validator
 */

import * as yup from 'yup';

export default {
  async validateWithdraw(data: any) {
    const schema = yup.object({
      toAddress: yup.string()
        .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid BSC address format')
        .required('To address is required'),
      
      amountUSDT: yup.number()
        .positive('Amount must be positive')
        .max(999999999, 'Amount too large')
        .test('decimal', 'Amount can have maximum 2 decimal places', (value) => {
          if (!value) return false;
          const decimalPlaces = value.toString().split('.')[1]?.length || 0;
          return decimalPlaces <= 2;
        })
        .required('Amount is required')
    });

    return await schema.validate(data);
  }
}; 