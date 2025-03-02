const express = require("express");
const { LidoSDK } = require("@lidofinance/lido-ethereum-sdk");
const { ethers } = require("ethers");

const router = express.Router();
const SEPOLIA_API_KEY = "7bb6501ed7b74d1e91fdd69ddfe59ce8";
const rpcUrl = `https://mainnet.infura.io/v3/{SEPOLIA_API_KEY}`;

console.log("RPC URL:", rpcUrl);

const provider = new ethers.JsonRpcProvider(rpcUrl);

const lidoSDK = new LidoSDK({
  chainId: 1,
  rpcUrls: [rpcUrl],
  web3Provider: provider,
});

router.get("/balance", async (req, res) => {
  try {
    const { evmAddress } = req.query;

    if (!evmAddress) {
      return res
        .status(400)
        .json({ message: "Missing required query parameter: address" });
    }

    const balanceWei = await lidoSDK.core.balanceETH(evmAddress);

    // Convert balance from Wei to Ether
    const balanceETH = ethers.formatEther(balanceWei);

    const balanceResponse = {
      balanceETH: balanceETH.toString(),
    };

    // Log the response before sending it
    console.log("Balance Response:", balanceResponse);
    res.json(balanceResponse);
  } catch (error) {
    console.error("Error fetching balance:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch balance", error: error.message });
  }
});

module.exports = router;
