const Web3 = require('web3');
const axios = require('axios');

// USDT合约地址 (BSC网络)
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const PROJECT_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // 项目方钱包地址

// USDT合约ABI (只包含Transfer事件)
const USDT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

class BlockchainListener {
  constructor() {
    this.web3 = new Web3('https://bsc-dataseed.binance.org/');
    this.usdtContract = new this.web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
    this.isListening = false;
    this.pendingRecharges = new Map(); // 存储待确认的充值记录
  }

  // 启动监听
  async startListening() {
    if (this.isListening) return;
    
    console.log('🚀 启动区块链监听服务...');
    this.isListening = true;

    // 监听Transfer事件
    this.usdtContract.events.Transfer({
      filter: { to: PROJECT_WALLET_ADDRESS },
      fromBlock: 'latest'
    }, (error, event) => {
      if (error) {
        console.error('区块链监听错误:', error);
        return;
      }

      this.handleTransferEvent(event);
    });

    console.log('✅ 区块链监听服务已启动');
  }

  // 处理转账事件
  async handleTransferEvent(event) {
    try {
      const { from, to, value } = event.returnValues;
      const amount = this.web3.utils.fromWei(value, 'ether'); // USDT有18位小数
      
      console.log(`💰 检测到转账: ${from} → ${to}, 金额: ${amount} USDT`);

      // 检查是否是项目方钱包
      if (to.toLowerCase() !== PROJECT_WALLET_ADDRESS.toLowerCase()) {
        return;
      }

      // 查找对应的充值记录
      const rechargeRecord = await this.findRechargeRecord(from, amount);
      if (rechargeRecord) {
        await this.processRecharge(rechargeRecord, event);
      } else {
        console.log('⚠️ 未找到对应的充值记录，可能是直接转账');
      }

    } catch (error) {
      console.error('处理转账事件错误:', error);
    }
  }

  // 查找充值记录
  async findRechargeRecord(fromAddress, amount) {
    try {
      const { strapi } = require('@strapi/strapi');
      
      const records = await strapi.query('api::recharge-record.recharge-record').findMany({
        where: {
          fromAddress: fromAddress.toLowerCase(),
          amount: amount,
          status: 'pending'
        },
        populate: ['user']
      });

      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('查找充值记录错误:', error);
      return null;
    }
  }

  // 处理充值
  async processRecharge(rechargeRecord, event) {
    try {
      const { strapi } = require('@strapi/strapi');
      
      console.log(`✅ 处理充值: 用户 ${rechargeRecord.user.id}, 金额 ${rechargeRecord.amount} USDT`);

      // 更新充值记录状态
      await strapi.query('api::recharge-record.recharge-record').update({
        where: { id: rechargeRecord.id },
        data: {
          status: 'confirmed',
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          confirmedAt: new Date()
        }
      });

      // 更新用户钱包余额
      await this.updateUserBalance(rechargeRecord.user.id, rechargeRecord.amount);

      console.log(`🎉 充值成功: 用户 ${rechargeRecord.user.id}, 余额已更新`);

    } catch (error) {
      console.error('处理充值错误:', error);
    }
  }

  // 更新用户余额
  async updateUserBalance(userId, amount) {
    try {
      const { strapi } = require('@strapi/strapi');
      
      // 获取用户钱包余额
      const balance = await strapi.query('api::wallet-balance.wallet-balance').findOne({
        where: { user: userId }
      });

      if (balance) {
        // 更新余额
        const newBalance = parseFloat(balance.usdtBalance || 0) + parseFloat(amount);
        await strapi.query('api::wallet-balance.wallet-balance').update({
          where: { id: balance.id },
          data: { usdtBalance: newBalance.toString() }
        });
      } else {
        // 创建新钱包余额
        await strapi.query('api::wallet-balance.wallet-balance').create({
          data: {
            user: userId,
            usdtBalance: amount.toString(),
            aiTokenBalance: '0'
          }
        });
      }

    } catch (error) {
      console.error('更新用户余额错误:', error);
    }
  }

  // 创建充值记录
  async createRechargeRecord(userId, amount, fromAddress) {
    try {
      const { strapi } = require('@strapi/strapi');
      
      const record = await strapi.query('api::recharge-record.recharge-record').create({
        data: {
          user: userId,
          amount: amount,
          fromAddress: fromAddress.toLowerCase(),
          toAddress: PROJECT_WALLET_ADDRESS.toLowerCase(),
          status: 'pending',
          asset: 'USDT',
          chain: 'BSC',
          createdAt: new Date()
        }
      });

      console.log(`📝 创建充值记录: 用户 ${userId}, 金额 ${amount} USDT`);
      return record;

    } catch (error) {
      console.error('创建充值记录错误:', error);
      throw error;
    }
  }

  // 检查充值状态
  async checkRechargeStatus(recordId) {
    try {
      const { strapi } = require('@strapi/strapi');
      
      const record = await strapi.query('api::recharge-record.recharge-record').findOne({
        where: { id: recordId },
        populate: ['user']
      });

      return record;

    } catch (error) {
      console.error('检查充值状态错误:', error);
      return null;
    }
  }

  // 停止监听
  stopListening() {
    this.isListening = false;
    console.log('🛑 区块链监听服务已停止');
  }
}

module.exports = BlockchainListener; 