import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789', 9);

export default {
  /**
   * 自动给用户生成 diamondId / referralCode.
   */
  async beforeCreate(event) {
    const { params } = event;

    // 生成唯一邀请码
    const code = nanoid();
    params.data.referralCode = code;

    // 生成唯一钻石ID
    params.data.diamondId = nanoid();
  },
}; 