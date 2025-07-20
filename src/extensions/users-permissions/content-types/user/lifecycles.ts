import { nanoid } from 'nanoid';

export default {
  async beforeCreate(event) {
    // 生成唯一 referralCode
    const code = nanoid(9);            // 例: 'qJX3pZ8kL'
    event.params.data.referralCode = code;
  }
}; 