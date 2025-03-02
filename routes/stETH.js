const express = require("express");
const {
  LidoSDK,
  TransactionCallbackStage,
} = require("@lidofinance/lido-ethereum-sdk");
const { ethers } = require("ethers");

const router = express.Router();

const SEPOLIA_API_KEY = "7bb6501ed7b74d1e91fdd69ddfe59ce8";
const rpcUrl = `https://mainnet.infura.io/v3/{SEPOLIA_API_KEY}`;
const provider = new ethers.JsonRpcProvider(rpcUrl);

const sdk = new LidoSDK({
  chainId: 1, // Sepolia Chain ID
  rpcUrls: [rpcUrl],
  web3Provider: provider, // Use ethers provider
});

console.log("LidoSDK initialized for Sepolia");

router.get("/wrap", async (req, res) => {
  try {
    const { amount, evmAddress } = req.query;

    if (!amount || !evmAddress) {
      return res.status(400).json({
        message: "Missing required query parameters: amount, evmAddress",
      });
    }

    // Convert amount to BigInt (wei)
    const valueInWei = ethers.parseEther(amount.toString());
    console.log("Wrapping value in wei:", valueInWei);

    // Get existing allowance
    const allowance = await sdk.wrap.getStethForWrapAllowance(evmAddress);
    console.log("Current Allowance:", allowance.toString());

    // Approve if necessary
    if (BigInt(allowance) < valueInWei) {
      console.log("Approving stETH for wrapping...");
      await sdk.wrap.approveStethForWrap({
        value: valueInWei,
      });
    }

    // Wrap stETH to wstETH
    console.log("Wrapping stETH to wstETH...");
    const wrapResult = await sdk.wrap?.wrapEth({
      value: valueInWei,
    });

    console.log("Wrap Transaction:", wrapResult);

    res.json({
      message: "stETH successfully wrapped to wstETH",
      transaction: wrapResult,
    });
  } catch (error) {
    console.error("Wrap transaction error:", error);
    res.status(500).json({
      message: "Failed to wrap stETH",
      error: error.message,
    });
  }
});

// Transaction callback function

module.exports = router;
