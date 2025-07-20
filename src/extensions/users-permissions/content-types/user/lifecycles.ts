import { customAlphabet } from 'nanoid';

// 0‑9A‑Z a‑z 共 62 个字符，长度固定 9 位
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 9);

export default {
  async beforeCreate(event) {
    // 保证第一次写入就带上字段
    event.params.data.diamondId = nanoid();
    event.params.data.referralCode = nanoid();
  },
}; 