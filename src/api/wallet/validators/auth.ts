/**
 * auth validator
 */

import * as yup from 'yup';

export default {
  async validateInviteRegister(data: any) {
    const schema = yup.object({
      username: yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .required('Username is required'),
      
      email: yup.string()
        .email('Invalid email format')
        .required('Email is required'),
      
      password: yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      
      inviteCode: yup.string()
        .optional()
        .min(6, 'Invite code must be at least 6 characters')
        .max(20, 'Invite code must be less than 20 characters')
    });

    return await schema.validate(data);
  }
}; 