const express = require("express");
const { LidoSDK, SDKError } = require("@lidofinance/lido-ethereum-sdk");
const { ethers } = require("ethers");

const router = express.Router();
const SEPOLIA_API_KEY = "7bb6501ed7b74d1e91fdd69ddfe59ce8";
const rpcUrl = `https://mainnet.infura.io/v3/{SEPOLIA_API_KEY}`;

const provider = new ethers.JsonRpcProvider(rpcUrl);

const sdk = new LidoSDK({
  chainId: 1, // Sepolia Chain ID
  rpcUrls: [rpcUrl],
  web3Provider: provider,
  modules: ["wrap"], // Ensure wrap module is available
});

console.log("LidoSDK initialized for Sepolia");

// ✅ GET API to Unwrap wstETH to stETH
router.get("/unwrap", async (req, res) => {
  try {
    const { value, account } = req.query;

    if (!value || !account) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters: value, account" });
    }

    console.log(
      "🔍 Checking if unwrap is available:",
      typeof sdk?.wrap?.unwrap
    );
    if (!sdk.wrap || !sdk.wrap.unwrap) {
      return res
        .status(500)
        .json({ message: "unwrap method is not available" });
    }

    const unwrapTx = await sdk.wrap.unwrap({
      value, // Amount of wstETH to unwrap
      account,
    });

    console.log(
      "✅ Full Transaction Response:",
      JSON.stringify(unwrapTx, null, 2)
    );

    res.json({
      message: "Unwrap transaction successful",
      transaction: unwrapTx,
      stethReceived: unwrapTx?.result?.stethReceived,
      wstethUnwrapped: unwrapTx?.result?.wstethUnwrapped,
    });
  } catch (error) {
    console.error("Unwrap transaction error:", error);
    res.status(500).json({
      message: "Unwrap transaction failed",
      error: error instanceof SDKError ? error.errorMessage : error.message,
    });
  }
});

module.exports = router;
