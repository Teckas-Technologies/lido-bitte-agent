const express = require("express");
const {
  LidoSDK,
  TransactionCallbackStage,
  SDKError,
} = require("@lidofinance/lido-ethereum-sdk");
const { ethers } = require("ethers");

const router = express.Router();
const SEPOLIA_API_KEY = "7bb6501ed7b74d1e91fdd69ddfe59ce8";
const rpcUrl = `https://mainnet.infura.io/v3/${SEPOLIA_API_KEY}`;

console.log("RPC URL:", rpcUrl);

const provider = new ethers.JsonRpcProvider(rpcUrl);

const sdk = new LidoSDK({
  chainId: 1, // Sepolia Chain ID
  rpcUrls: [rpcUrl],
  web3Provider: provider, // Use ethers provider
});

console.log("LidoSDK initialized for Sepolia");

// ✅ GET API to Wrap ETH
router.get("/wrap", async (req, res) => {
  try {
    const { value, account } = req.query;

    if (!value || !account) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters: value, account" });
    }
    console.log(
      "Checking if wrapETH is available:",
      typeof sdk?.staking?.wrapETH
    );
    const wrapTx = await sdk?.staking?.wrapETH({
      value,
      account,
    });
    console.log("Full Transaction Response:", JSON.stringify(wrapTx, null, 2));
    res.json({
      message: "Wrap ETH transaction successful",
      transaction: wrapTx,
      stethWrapped: wrapTx?.result.stethWrapped,
      wstethReceived: wrapTx?.result.wstethReceived,
    });
  } catch (error) {
    console.error("Wrap transaction error:", error);
    res.status(500).json({
      message: "Wrap transaction failed",
      error: error instanceof SDKError ? error.errorMessage : error.message,
    });
  }
});

module.exports = router;
