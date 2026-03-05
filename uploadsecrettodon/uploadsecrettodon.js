/**
 * uploadSecretToDON.js - Chainlink Functions 密钥上传脚本
 * 
 * 📋 主要功能：
 * 将 Azure API 密钥安全地上传到 Chainlink DON
 */

import { SecretsManager } from "@chainlink/functions-toolkit";
import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";

// 加载环境变量
dotenv.config({ path: "./.env.local" });

/**
 * 主函数：上传密钥到 Chainlink DON
 */
const uploadSecrets = async () => {
  console.log("🚀 Starting secret upload process...\n");

  // ============================================
  // 步骤1：验证环境变量
  // ============================================
  console.log("📋 Step 1: Validating environment variables...");
  
  const requiredEnvVars = {
//     ETHEREUM_PROVIDER_AVALANCHEFUJI=https://api.avax-test.network/ext/bc/C/rpc
// Azure_API_KEY=fromchainlinktothisazurefunction
// EVM_PRIVATE_KEY=0x522213792f34a57b14b0cade83b3a1cca9b2f25a814db6d0246f81a95622ee61
    ETHEREUM_PROVIDER_AVALANCHEFUJI: process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI,
    AZURE_API_KEY: process.env.AZURE_API_KEY,
    EVM_PRIVATE_KEY: process.env.EVM_PRIVATE_KEY
  };

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.error(`❌ Missing: ${key}`);
      console.log("\n💡 Please create .env.local file with:");
      console.log("ETHEREUM_PROVIDER_AVALANCHEFUJI=https://rpc.ankr.com/avalanche_fuji");
      console.log("EVM_PRIVATE_KEY=your_private_key_here");
      console.log("AZURE_API_KEY=your_azure_api_key_here");
      throw new Error(`${key} not provided`);
    }
  }
  console.log("✅ All environment variables found\n");

  // ============================================
  // 步骤2：配置网络参数
  // ============================================
  console.log("📋 Step 2: Configuring network parameters...");
  
  // Avalanche Fuji 测试网配置
  const networkConfig = {
    chainId: 43113,
    name: "Avalanche Fuji",
    rpcUrl: process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI,
    routerAddress: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0", // Fuji Functions Router
    donId: "fun-avalanche-fuji-1",
    gatewayUrls: [
      "https://01.functions-gateway.testnet.chain.link/",
      "https://02.functions-gateway.testnet.chain.link/",
    ]
  };

  console.log(`   Network: ${networkConfig.name}`);
  console.log(`   Chain ID: ${networkConfig.chainId}`);
  console.log(`   RPC: ${networkConfig.rpcUrl}`);
  console.log(`   Router: ${networkConfig.routerAddress}\n`);

  // ============================================
  // 步骤3：测试网络连接
  // ============================================
  console.log("📋 Step 3: Testing network connection...");
  
  const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
  
  try {
    const network = await provider.getNetwork();
    console.log(`   ✅ Connected to: ${network.name || 'unknown'} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== networkConfig.chainId) {
      console.warn(`   ⚠️  Warning: Expected Chain ID ${networkConfig.chainId}, got ${network.chainId}`);
    }

    // 测试获取区块高度
    const blockNumber = await provider.getBlockNumber();
    console.log(`   📦 Current block: ${blockNumber}\n`);
  } catch (error) {
    console.error("   ❌ Network connection failed:", error.message);
    console.log("\n💡 Try these RPC URLs:");
    console.log("   - https://rpc.ankr.com/avalanche_fuji");
    console.log("   - https://api.avax-test.network/ext/bc/C/rpc");
    console.log("   - https://avalanche-fuji-c-chain-rpc.publicnode.com");
    throw error;
  }

  // ============================================
  // 步骤4：创建签名器
  // ============================================
  console.log("📋 Step 4: Creating signer...");
  
  const privateKey = process.env.EVM_PRIVATE_KEY;
  if (!privateKey.startsWith('0x')) {
    throw new Error("Private key must start with 0x");
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  const address = await wallet.getAddress();
  
  console.log(`   🔑 Wallet address: ${address}`);
  
  // 检查余额
  try {
    const balance = await wallet.getBalance();
    const balanceInAvax = ethers.utils.formatEther(balance);
    console.log(`   💰 Balance: ${balanceInAvax} AVAX`);
    
    if (balance.isZero()) {
      console.warn("   ⚠️  Warning: Wallet has 0 AVAX balance!");
      console.log("   💡 Get free AVAX from: https://faucet.avax.network/");
    }
  } catch (error) {
    console.log(`   ⚠️  Could not fetch balance: ${error.message}`);
  }
  console.log();

  // ============================================
  // 步骤5：准备密钥数据
  // ============================================
  console.log("📋 Step 5: Preparing secrets...");
  
  const secrets = {
    apiKey: process.env.AZURE_API_KEY
  };
  
  console.log(`   🔐 Secret keys to upload: ${Object.keys(secrets).join(', ')}\n`);

  // ============================================
  // 步骤6：初始化 SecretsManager
  // ============================================
  console.log("📋 Step 6: Initializing SecretsManager...");
  
  let secretsManager;
  try {
    secretsManager = new SecretsManager({
      signer: wallet,
      functionsRouterAddress: networkConfig.routerAddress,
      donId: networkConfig.donId,
    });
    
    await secretsManager.initialize();
    console.log("   ✅ SecretsManager initialized successfully\n");
  } catch (error) {
    console.error("   ❌ Failed to initialize SecretsManager:", error.message);
    console.log("\n💡 Possible issues:");
    console.log("   1. Router address incorrect");
    console.log("   2. Network connection unstable");
    console.log("   3. DON ID incorrect");
    throw error;
  }

  // ============================================
  // 步骤7：加密密钥
  // ============================================
  console.log("📋 Step 7: Encrypting secrets...");
  
  let encryptedSecretsObj;
  try {
    encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);
    console.log("   ✅ Secrets encrypted successfully");
    console.log(`   📏 Encrypted data length: ${encryptedSecretsObj.encryptedSecrets.length} bytes\n`);
  } catch (error) {
    console.error("   ❌ Encryption failed:", error.message);
    throw error;
  }

  // ============================================
  // 步骤8：上传到 DON
  // ============================================
  console.log("📋 Step 8: Uploading encrypted secrets to DON...");
  
  const slotId = 0;
  const expirationMinutes = 1440; // 24 hours
  
  console.log(`   📍 Slot ID: ${slotId}`);
  console.log(`   ⏰ Expiration: ${expirationMinutes} minutes (24 hours)`);
  console.log(`   🌐 Gateways: ${networkConfig.gatewayUrls.length} endpoints`);
  
  let uploadResult;
  try {
    uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
      encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
      gatewayUrls: networkConfig.gatewayUrls,
      slotId: slotId,
      minutesUntilExpiration: expirationMinutes,
    });
    
    if (!uploadResult.success) {
      throw new Error("Upload returned success=false");
    }
    
    console.log("   ✅ Upload successful!\n");
  } catch (error) {
    console.error("   ❌ Upload failed:", error.message);
    console.log("\n💡 Possible issues:");
    console.log("   1. Gateway URLs unreachable");
    console.log("   2. Network timeout");
    console.log("   3. Invalid encrypted data");
    throw error;
  }

  // ============================================
  // 步骤9：保存配置信息
  // ============================================
  console.log("📋 Step 9: Saving configuration...");
  
  const donHostedSecretsVersion = parseInt(uploadResult.version);
  
  const configInfo = {
    network: networkConfig.name,
    chainId: networkConfig.chainId,
    donId: networkConfig.donId,
    routerAddress: networkConfig.routerAddress,
    slotId: slotId,
    donHostedSecretsVersion: donHostedSecretsVersion,
    expirationMinutes: expirationMinutes,
    uploadedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString(),
    walletAddress: address
  };

  const configFilePath = "donSecretsConfig.json";
  fs.writeFileSync(configFilePath, JSON.stringify(configInfo, null, 2));
  
  console.log(`   ✅ Configuration saved to: ${configFilePath}\n`);

  // ============================================
  // 完成！显示摘要信息
  // ============================================
  console.log("═══════════════════════════════════════════════════");
  console.log("🎉 SUCCESS! Secrets uploaded to Chainlink DON");
  console.log("═══════════════════════════════════════════════════");
  console.log(`📋 DON Secrets Version: ${donHostedSecretsVersion}`);
  console.log(`📍 Slot ID: ${slotId}`);
  console.log(`⏰ Expires: ${configInfo.expiresAt}`);
  console.log(`📄 Config saved: ${configFilePath}`);
  console.log("═══════════════════════════════════════════════════\n");
  
  console.log("🔧 Next Steps:");
  console.log("1. Deploy your FunctionsConsumer contract");
  console.log(`2. Call: setDonHostSecretConfig(${slotId}, ${donHostedSecretsVersion}, YOUR_SUBSCRIPTION_ID)`);
  console.log("3. Then you can call: sendRequest()");
  console.log("\n💡 Tip: Keep donSecretsConfig.json for reference!");

  return configInfo;
};

// ============================================
// 执行脚本
// ============================================
uploadSecrets()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n❌ Script failed:", error.message);
    console.error("\n🔍 Full error:", error);
    process.exit(1);
  });