/**
 * BSC链上转账服务
 * 实现真实的BSC链上AI代币转账功能
 */

import { factories } from '@strapi/strapi';
import Web3 from 'web3';

export default factories.createCoreService('api::ai-token-withdraw.ai-token-withdraw' as any, ({ strapi }) => ({
  // BSC网络配置
  bscConfig: {
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
    chainId: 56,
    gasLimit: 21000,
    gasPrice: '5000000000' // 5 Gwei
  },

  // AI代币合约配置
  aiTokenConfig: {
    contractAddress: process.env.AI_TOKEN_CONTRACT_ADDRESS || '0x...', // AI代币合约地址
    decimals: 18,
    symbol: 'AI'
  },

  // 平台钱包配置
  platformWallet: {
    privateKey: process.env.PLATFORM_WALLET_PRIVATE_KEY || '',
    address: process.env.PLATFORM_WALLET_ADDRESS || ''
  },

  // 初始化Web3
  getWeb3() {
    return new Web3(this.bscConfig.rpcUrl);
  },

  // 获取AI代币合约实例
  getAiTokenContract(web3) {
    const contractABI = [
      {
        "constant": false,
        "inputs": [
          {"name": "_to", "type": "address"},
          {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ];

    return new web3.eth.Contract(contractABI, this.aiTokenConfig.contractAddress);
  },

  // 检查平台钱包余额
  async checkPlatformBalance() {
    try {
      const web3 = this.getWeb3();
      const contract = this.getAiTokenContract(web3);
      
      const balance = await contract.methods.balanceOf(this.platformWallet.address).call();
      const balanceInTokens = web3.utils.fromWei(balance, 'ether');
      
      console.log(`💰 平台钱包AI代币余额: ${balanceInTokens} AI`);
      return parseFloat(balanceInTokens);
    } catch (error) {
      console.error('❌ 检查平台钱包余额失败:', error);
      return 0;
    }
  },

  // 执行AI代币转账
  async transferAiTokens(toAddress, amount) {
    try {
      console.log(`🔄 开始BSC链上AI代币转账...`);
      console.log(`📤 从: ${this.platformWallet.address}`);
      console.log(`📥 到: ${toAddress}`);
      console.log(`💰 金额: ${amount} AI`);

      const web3 = this.getWeb3();
      const contract = this.getAiTokenContract(web3);

      // 检查平台钱包余额
      const platformBalance = await this.checkPlatformBalance();
      if (platformBalance < amount) {
        throw new Error(`平台钱包余额不足: ${platformBalance} AI < ${amount} AI`);
      }

      // 准备交易参数
      const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
      const gasPrice = web3.utils.toWei(this.bscConfig.gasPrice, 'wei');

      // 创建交易
      const transaction = contract.methods.transfer(toAddress, amountInWei);
      const gas = await transaction.estimateGas({ from: this.platformWallet.address });

      const txData = {
        from: this.platformWallet.address,
        to: this.aiTokenConfig.contractAddress,
        gas: gas,
        gasPrice: gasPrice,
        data: transaction.encodeABI()
      };

      // 签名并发送交易
      const signedTx = await web3.eth.accounts.signTransaction(txData, this.platformWallet.privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      console.log(`✅ BSC链上AI代币转账成功!`);
      console.log(`📋 交易哈希: ${receipt.transactionHash}`);
      console.log(`⛽ Gas使用: ${receipt.gasUsed}`);
      console.log(`💰 转账金额: ${amount} AI`);

      return {
        success: true,
        txHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed,
        amount: amount
      };

    } catch (error) {
      console.error('❌ BSC链上AI代币转账失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 验证BSC地址
  validateBscAddress(address) {
    const web3 = this.getWeb3();
    return web3.utils.isAddress(address);
  },

  // 获取BSC网络状态
  async getBscNetworkStatus() {
    try {
      const web3 = this.getWeb3();
      const blockNumber = await web3.eth.getBlockNumber();
      const gasPrice = await web3.eth.getGasPrice();
      
      return {
        blockNumber,
        gasPrice: web3.utils.fromWei(gasPrice, 'gwei'),
        network: 'BSC Mainnet'
      };
    } catch (error) {
      console.error('❌ 获取BSC网络状态失败:', error);
      return null;
    }
  },

  // 监控BSC交易状态
  async monitorTransaction(txHash) {
    try {
      const web3 = this.getWeb3();
      const receipt = await web3.eth.getTransactionReceipt(txHash);
      
      if (receipt) {
        return {
          confirmed: true,
          status: receipt.status ? 'success' : 'failed',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed
        };
      } else {
        return {
          confirmed: false,
          status: 'pending'
        };
      }
    } catch (error) {
      console.error('❌ 监控交易状态失败:', error);
      return {
        confirmed: false,
        status: 'error',
        error: error.message
      };
    }
  }
})); 