const express = require("express");
const {
  LidoSDK,
  TransactionCallbackStage,
  SDKError,
} = require("@lidofinance/lido-ethereum-sdk");
const { ethers } = require("ethers");
const { signRequestFor } = require("@bitte-ai/agent-sdk");

const router = express.Router();
const SEPOLIA_API_KEY = "7bb6501ed7b74d1e91fdd69ddfe59ce8";
const rpcUrl = `https://mainnet.infura.io/v3/{SEPOLIA_API_KEY}`;

console.log("RPC URL:", rpcUrl);

const provider = new ethers.JsonRpcProvider(rpcUrl);

const sdk = new LidoSDK({
  chainId: 1, // Sepolia Chain ID
  rpcUrls: [rpcUrl],
  web3Provider: provider, // Use ethers provider
});

console.log("LidoSDK initialized for Sepolia");

// router.get("/stake", async (req, res) => {
//   try {
//     const { value, referralAddress, account } = req.query;

//     if (!value || !account) {
//       return res
//         .status(400)
//         .json({ message: "Missing required query parameters: value, account" });
//     }

//     const callback = ({ stage, payload }) => {
//       switch (stage) {
//         case TransactionCallbackStage.SIGN:
//           console.log("Waiting for user to sign transaction");
//           break;
//         case TransactionCallbackStage.RECEIPT:
//           console.log("Transaction receipt received:", payload);
//           break;
//         case TransactionCallbackStage.CONFIRMATION:
//           console.log("Transaction confirmed:", payload);
//           break;
//         case TransactionCallbackStage.DONE:
//           console.log("Transaction successful:", payload);
//           break;
//         case TransactionCallbackStage.ERROR:
//           console.error("Transaction failed:", payload);
//           break;
//       }
//     };

//     const stakeTx = await sdk.stake.stakeEth({
//       value,
//       callback,
//       referralAddress,
//       account,
//     });

//     res.json({
//       message: "Stake transaction successful",
//       transaction: stakeTx,
//     });
//   } catch (error) {
//     console.error("Stake transaction error:", error);
//     res.status(500).json({
//       message: "Stake transaction failed",
//       error: error instanceof SDKError ? error.errorMessage : error.message,
//     });
//   }
// });

// ✅ GET API to Populate Transaction
router.get("/stake", async (req, res) => {
  try {
    const { amount, evmAddress } = req.query;

    if (!amount || !evmAddress) {
      return res
        .status(400)
        .json({ message: "Missing required query parameters: value, account" });
    }

    // Convert amount to BigInt (wei)
    const valueInWei = ethers.parseEther(amount.toString());
    console.log("value ---", valueInWei);

    const populateResult = await sdk.stake.stakeEthPopulateTx({
      value: valueInWei, // Ensure this is BigInt in wei
      account: evmAddress,
    });
    console.log("---------", populateResult);

    // Convert BigInt values to strings (JSON safe)
    const sanitizedResult = JSON.parse(
      JSON.stringify(populateResult, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    console.log("Sanitized Value Before Transaction:", sanitizedResult.value);
    console.log(
      "Sanitized Decimal Value:",
      BigInt(sanitizedResult.value).toString(10) // Explicitly ensure decimal format
    );

    // Format the transaction
    const transaction = {
      to: sanitizedResult.to,
      value: BigInt(sanitizedResult.value).toString(10), // Ensure decimal string
      data: sanitizedResult.data || "0x",
    };

    console.log("Transaction Object Before Signing:", transaction);

    // Ensure value remains in decimal format inside `signRequestFor()`
    const populateTransaction = signRequestFor({
      chainId: 1,
      metaTransactions: [
        {
          ...transaction,
          value: BigInt(transaction.value).toString(), // Ensure decimal format before passing
        },
      ],
    });

    console.log(
      "Final Transaction Before Response:",
      JSON.stringify(populateTransaction, null, 2)
    );

    res.json({
      evmSignRequest: populateTransaction,
    });
  } catch (error) {
    console.error("Populate transaction error:", error);
    res.status(500).json({
      message: "Failed to populate transaction",
      error: error.message,
    });
  }
});

// ✅ GET API to Simulate Transaction
// router.get("/simulate", async (req, res) => {
//   try {
//     const { value, referralAddress, account } = req.query;

//     if (!value || !account) {
//       return res
//         .status(400)
//         .json({ message: "Missing required query parameters: value, account" });
//     }

//     const simulateResult = await sdk.stake.stakeEthSimulateTx({
//       value,
//       referralAddress,
//       account,
//     });

//     // Convert any BigInt values to strings before sending the response
//     const sanitizedResult = JSON.parse(
//       JSON.stringify(simulateResult, (key, value) =>
//         typeof value === "bigint" ? value.toString() : value
//       )
//     );

//     res.json({
//       message: "Transaction simulated successfully",
//       simulateResult: sanitizedResult,
//     });
//   } catch (error) {
//     console.error("Simulate transaction error:", error);
//     res.status(500).json({
//       message: "Failed to simulate transaction",
//       error: error.message,
//     });
//   }
// });

module.exports = router;
