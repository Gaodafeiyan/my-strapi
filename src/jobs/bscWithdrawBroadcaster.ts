import Web3 from 'web3';
// @ts-ignore
import { Strapi } from '@strapi/strapi';

// USDT合约地址 (BSC网络)
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// USDT合约ABI (包含transfer方法)
const USDT_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

interface WithdrawRecord {
  id: number;
  user: { id: number };
  amount: string;
  toAddress: string;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
  createdAt: Date;
}

class BSCWithdrawBroadcaster {
  private web3: Web3;
  private usdtContract: any;
  private strapi: Strapi;
  private projectWalletPrivateKey: string;

  constructor(strapi: Strapi) {
    this.strapi = strapi;
    this.web3 = new Web3('https://bsc-dataseed.binance.org/');
    this.usdtContract = new this.web3.eth.Contract(USDT_ABI, USDT_CONTRACT_ADDRESS);
    
    // 从环境变量获取项目方钱包私钥
    this.projectWalletPrivateKey = process.env.PROJECT_WALLET_PRIVATE_KEY || '';
    
    if (!this.projectWalletPrivateKey) {
      console.error('❌ 未设置项目方钱包私钥环境变量 PROJECT_WALLET_PRIVATE_KEY');
    }
  }

  async execute() {
    try {
      if (!this.projectWalletPrivateKey) {
        console.log('⚠️ 跳过提现广播 - 未配置钱包私钥');
        return;
      }

      console.log('🔍 开始处理BSC提现请求...');
      
      // 获取待处理的提现记录
      const pendingWithdraws = await this.getPendingWithdraws();
      
      if (pendingWithdraws.length === 0) {
        console.log('📊 没有待处理的提现请求');
        return;
      }

      console.log(`💰 发现 ${pendingWithdraws.length} 个待处理提现请求`);

      for (const withdraw of pendingWithdraws) {
        await this.processWithdraw(withdraw);
      }

      console.log('✅ BSC提现广播完成');

    } catch (error) {
      console.error('❌ BSC提现广播错误:', error);
    }
  }

  private async getPendingWithdraws(): Promise<WithdrawRecord[]> {
    try {
      const withdraws = await this.strapi.entityService.findMany('api::usdt-withdraw.usdt-withdraw' as any, {
        filters: {
          status: 'pending'
        },
        sort: { createdAt: 'asc' },
        limit: 10,
        populate: ['user']
      }) as WithdrawRecord[];

      return withdraws;
    } catch (error) {
      console.error('获取待处理提现记录错误:', error);
      return [];
    }
  }

  private async processWithdraw(withdraw: WithdrawRecord) {
    try {
      console.log(`💰 处理提现: 用户 ${withdraw.user.id}, 金额 ${withdraw.amount} USDT, 地址 ${withdraw.toAddress}`);

      // 检查项目方钱包余额
      const projectWalletAddress = this.web3.eth.accounts.privateKeyToAccount(this.projectWalletPrivateKey).address;
      const usdtBalance = await this.usdtContract.methods.balanceOf(projectWalletAddress).call();
      const withdrawAmount = this.web3.utils.toWei(withdraw.amount, 'ether');

      if (parseInt(usdtBalance) < parseInt(withdrawAmount)) {
        console.log(`❌ 项目方钱包USDT余额不足: ${this.web3.utils.fromWei(usdtBalance, 'ether')} < ${withdraw.amount}`);
        await this.markWithdrawFailed(withdraw.id, '项目方钱包USDT余额不足');
        return;
      }

      // 执行转账
      const result = await this.broadcastWithdraw(withdraw, withdrawAmount);
      
      if (result.success) {
        await this.markWithdrawSuccess(withdraw.id, result.txHash.toString());
        await this.sendSocketNotification(withdraw.user.id, 'success', withdraw.amount, result.txHash.toString());
        console.log(`✅ 提现成功: 交易哈希 ${result.txHash}`);
      } else {
        await this.markWithdrawFailed(withdraw.id, result.error);
        await this.sendSocketNotification(withdraw.user.id, 'failed', withdraw.amount, null);
        console.log(`❌ 提现失败: ${result.error}`);
      }

    } catch (error) {
      console.error('处理提现错误:', error);
      await this.markWithdrawFailed(withdraw.id, error.message);
      await this.sendSocketNotification(withdraw.user.id, 'failed', withdraw.amount, null);
    }
  }

  private async broadcastWithdraw(withdraw: WithdrawRecord, amountWei: string) {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(this.projectWalletPrivateKey);
      const fromAddress = account.address;

      // 获取当前gas价格
      const gasPrice = await this.web3.eth.getGasPrice();
      
      // 估算gas限制
      const gasLimit = await this.usdtContract.methods.transfer(withdraw.toAddress, amountWei).estimateGas({
        from: fromAddress
      });

      // 构建交易
      const tx = {
        from: fromAddress,
        to: USDT_CONTRACT_ADDRESS,
        gas: Math.floor(gasLimit * 1.2), // 增加20%的gas限制
        gasPrice: gasPrice,
        data: this.usdtContract.methods.transfer(withdraw.toAddress, amountWei).encodeABI()
      };

      // 签名并发送交易
      const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.projectWalletPrivateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      return {
        success: true,
        txHash: receipt.transactionHash
      };

    } catch (error) {
      console.error('广播提现交易错误:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async markWithdrawSuccess(withdrawId: number, txHash: string) {
    try {
      await this.strapi.entityService.update('api::usdt-withdraw.usdt-withdraw' as any, withdrawId, {
        data: {
          status: 'success',
          txHash: txHash,
          processedAt: new Date()
        }
      });

      // 更新对应的钱包交易记录
      const walletTxs = await this.strapi.entityService.findMany('api::wallet-tx.wallet-tx' as any, {
        filters: {
          tx_type: 'withdraw',
          status: 'pending'
        }
      }) as any[];

      if (walletTxs.length > 0) {
        await this.strapi.entityService.update('api::wallet-tx.wallet-tx' as any, walletTxs[0].id, {
          data: {
            status: 'success',
            tx_hash: txHash
          }
        });
      }

    } catch (error) {
      console.error('标记提现成功错误:', error);
    }
  }

  private async markWithdrawFailed(withdrawId: number, error: string) {
    try {
      await this.strapi.entityService.update('api::usdt-withdraw.usdt-withdraw' as any, withdrawId, {
        data: {
          status: 'failed',
          error: error,
          processedAt: new Date()
        }
      });

      // 返还用户余额
      await this.refundUserBalance(withdrawId);

    } catch (error) {
      console.error('标记提现失败错误:', error);
    }
  }

  private async refundUserBalance(withdrawId: number) {
    try {
      const withdraw = await this.strapi.entityService.findOne('api::usdt-withdraw.usdt-withdraw' as any, withdrawId, {
        populate: ['user']
      }) as WithdrawRecord;

      if (!withdraw) return;

      const balance = await this.strapi.entityService.findMany('api::wallet-balance.wallet-balance' as any, {
        filters: {
          user: withdraw.user.id
        }
      }) as any[];

      if (balance.length > 0) {
        const currentBalance = balance[0];
        const newBalance = parseFloat(currentBalance.usdtBalance || 0) + parseFloat(withdraw.amount);
        
        await this.strapi.entityService.update('api::wallet-balance.wallet-balance' as any, currentBalance.id, {
          data: {
            usdtBalance: newBalance.toString()
          }
        });

        console.log(`💰 已返还用户 ${withdraw.user.id} 余额: ${withdraw.amount} USDT`);
      }

    } catch (error) {
      console.error('返还用户余额错误:', error);
    }
  }

  private async sendSocketNotification(userId: number, status: 'success' | 'failed', amount: string, txHash?: string) {
    try {
      console.log(`📡 Socket通知: withdraw:${userId} - 提现${status === 'success' ? '成功' : '失败'} ${amount} USDT${txHash ? `, 交易哈希: ${txHash}` : ''}`);
      
      // 实际实现时需要使用Socket.IO
      // io.to(`withdraw:${userId}`).emit(status, { amount, txHash });
      
    } catch (error) {
      console.error('发送Socket通知错误:', error);
    }
  }
}

export default BSCWithdrawBroadcaster; 