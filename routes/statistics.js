const express = require("express");
const { LidoSDK } = require("@lidofinance/lido-ethereum-sdk");
const { ethers } = require("ethers");

const router = express.Router();

// Infura RPC for Sepolia
const SEPOLIA_API_KEY = "7bb6501ed7b74d1e91fdd69ddfe59ce8";
const rpcUrl = `https://sepolia.infura.io/v3/${SEPOLIA_API_KEY}`;
const provider = new ethers.JsonRpcProvider(rpcUrl);

// Initialize Lido SDK
const sdk = new LidoSDK({
  chainId: 11155111, // Sepolia Chain ID
  rpcUrls: [rpcUrl],
  web3Provider: provider, // Use ethers provider
});

// Get the last recorded APR
router.get("/apr/last", async (req, res) => {
  try {
    const lastApr = await sdk.statistics.apr.getLastApr();
    res.json({ lastApr });
  } catch (error) {
    console.error("Error fetching last APR:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch last APR", error: error.message });
  }
});

// Get the SMA APR for a given number of days
router.get("/apr/sma", async (req, res) => {
  try {
    const { days } = req.query;
    if (!days || isNaN(days)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing days parameter" });
    }

    const smaApr = await sdk.statistics.apr.getSmaApr({ days: Number(days) });
    res.json({ days: Number(days), smaApr });
  } catch (error) {
    console.error("Error fetching SMA APR:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch SMA APR", error: error.message });
  }
});

module.exports = router;
