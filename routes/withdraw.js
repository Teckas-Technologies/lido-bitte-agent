const express = require("express");
const {
  LidoSDK,
  TransactionCallbackStage,
  SDKError,
} = require("@lidofinance/lido-ethereum-sdk");
const { ethers } = require("ethers");
const { signRequestFor } = require("@bitte-ai/agent-sdk");
const { parseEther } = require("viem");
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

const splitAmount = async (amount, token) => {
  try {
    if (!amount || !token) {
      throw new Error("Missing required parameters: amount, token");
    }

    let parsedAmount;
    try {
      parsedAmount = parseEther(amount); // Convert decimal to BigInt (wei)
    } catch (error) {
      throw new Error("Invalid amount format. Must be a valid decimal number.");
    }

    // Generate requests dynamically
    return await sdk.withdraw?.request.splitAmountToRequests({
      amount: parsedAmount,
      token,
    });
  } catch (error) {
    console.error("Error splitting amount:", error);
    throw error;
  }
};

// API Route
router.get("/withdraw", async (req, res) => {
  try {
    const { token, amount, evmAddress } = req.query;

    if (!token || !evmAddress || !amount) {
      return res.status(400).json({
        message:
          "Missing required query parameters: token, evmAddress, or amount",
      });
    }

    // Ensure token is valid (either "stETH" or "wstETH")
    const userToken = token.toString().trim();
    if (userToken !== "stETH" && userToken !== "wstETH") {
      return res.status(400).json({
        message: "Invalid token type. Allowed values: stETH, wstETH",
      });
    }

    // Generate requests dynamically using splitAmount function
    const requests = await splitAmount(amount, userToken);
    console.log("Generated withdrawal requests:", requests);

    const callback = ({ stage, payload }) => {
      switch (stage) {
        case TransactionCallbackStage.PERMIT:
          console.log("wait for permit");
          break;
        case TransactionCallbackStage.GAS_LIMIT:
          console.log("wait for gas limit");
          break;
        case TransactionCallbackStage.SIGN:
          console.log("wait for sign");
          break;
        case TransactionCallbackStage.RECEIPT:
          console.log("wait for receipt", payload);
          break;
        case TransactionCallbackStage.CONFIRMATION:
          console.log("wait for confirmation", payload);
          break;
        case TransactionCallbackStage.DONE:
          console.log("Transaction completed", payload);
          break;
        case TransactionCallbackStage.ERROR:
          console.error("Transaction error", payload);
          break;
      }
    };

    const requestTx = await sdk.withdraw?.request.requestWithdrawalPopulateTx({
      requests,
      token: userToken,
      callback,
      account: evmAddress,
    });

    console.log("Raw Withdrawal Transaction:", requestTx);

    // Convert BigInt values to JSON-safe strings
    const sanitizedResult = JSON.parse(
      JSON.stringify(requestTx, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    console.log("Sanitized Withdrawal Transaction:", sanitizedResult);

    // Construct the transaction object
    const transaction = {
      to: sanitizedResult.to,
      value: parseEther(amount).toString(), // Ensure correct decimal format
      data: sanitizedResult.data || "0x",
    };

    console.log("Formatted Transaction Before Signing:", transaction);

    // Format the final transaction for signing
    const populateTransaction = signRequestFor({
      chainId: 1,
      metaTransactions: [
        {
          ...transaction,
          value: BigInt(transaction.value).toString(), // Convert BigInt to string
        },
      ],
    });

    console.log(
      "Final Transaction Before Response:",
      JSON.stringify(populateTransaction, null, 2)
    );

    res.json({
      message: "Withdrawal request initiated successfully",
      evmSignRequest: populateTransaction,
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({
      message: "Failed to initiate withdrawal",
      error: error.message,
    });
  }
});

router.get("/withdraw-allowance", async (req, res) => {
  try {
    const { requests, amount, token } = req.query;

    if (!requests || !amount || !token) {
      return res.status(400).json({
        message: "Missing required query parameters: requests, amount, token",
      });
    }

    const requestTx = await sdk.withdraw?.request.requestWithdrawal({
      amount: BigInt(amount), // Convert to BigInt
      token, // 'stETH' | 'wstETH'
    });

    console.log("Withdrawal transaction result:", requestTx);

    res.json({
      message: "Withdrawal request initiated successfully",
      transaction: requestTx,
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({
      message: "Failed to initiate withdrawal",
      error: error.message,
    });
  }
});

router.get("/claim", async (req, res) => {
  try {
    const { requestsIds } = req.query;

    if (!requestsIds) {
      return res
        .status(400)
        .json({ message: "Missing required query parameter: requestsIds" });
    }

    // Convert requestsIds from string to BigInt array
    const requestIdsArray = requestsIds.split(",").map((id) => BigInt(id));

    const claimTx = await sdk.withdrawals.claim.claimRequests({
      requestsIds: requestIdsArray,
      callback,
    });

    const response = {
      transactionHash: claimTx.hash,
      receipt: claimTx.receipt,
      confirmations: claimTx.confirmations,
      claimedRequests: claimTx.result?.requests || [],
    };

    console.log("Claim Transaction Response:", response);
    res.json(response);
  } catch (error) {
    console.error("Error processing claim request:", error);
    res
      .status(500)
      .json({ message: "Failed to claim requests", error: error.message });
  }
});

router.get("/approve", async (req, res) => {
  try {
    const { token, amount, evmAddress } = req.query;

    if (!token || !evmAddress || !amount) {
      return res.status(400).json({
        message:
          "Missing required query parameters: token, evmAddress, or amount",
      });
    }

    const callback = ({ stage, payload }) => {
      switch (stage) {
        case TransactionCallbackStage.PERMIT:
          console.log("wait for permit");
          break;
        case TransactionCallbackStage.GAS_LIMIT:
          console.log("wait for gas limit");
          break;
        case TransactionCallbackStage.SIGN:
          console.log("wait for sign");
          break;
        case TransactionCallbackStage.RECEIPT:
          console.log("wait for receipt", payload);
          break;
        case TransactionCallbackStage.CONFIRMATION:
          console.log("wait for confirmation", payload);
          break;
        case TransactionCallbackStage.DONE:
          console.log("Transaction completed", payload);
          break;
        case TransactionCallbackStage.ERROR:
          console.error("Transaction error", payload);
          break;
      }
    };
    const valueInWei = ethers.parseEther(amount.toString());
    const userToken = token.toString().trim();
    const requestTx = await sdk.withdraw?.approval.approve({
      amount: valueInWei,
      token: userToken,
      callback,
      account: evmAddress,
    });

    console.log("Raw Withdrawal Transaction:", requestTx);

    // Convert BigInt values to JSON-safe strings
    const sanitizedResult = JSON.parse(
      JSON.stringify(requestTx, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    console.log("Sanitized Withdrawal Transaction:", sanitizedResult);

    // Construct the transaction object
    const transaction = {
      to: sanitizedResult.to,
      value: parseEther(amount).toString(), // Ensure correct decimal format
      data: sanitizedResult.data || "0x",
    };

    console.log("Formatted Transaction Before Signing:", transaction);

    // Format the final transaction for signing
    const populateTransaction = signRequestFor({
      chainId: 1,
      metaTransactions: [
        {
          ...transaction,
          value: BigInt(transaction.value).toString(), // Convert BigInt to string
        },
      ],
    });

    console.log(
      "Final Transaction Before Response:",
      JSON.stringify(populateTransaction, null, 2)
    );

    res.json({
      message: "Withdrawal request initiated successfully",
      evmSignRequest: populateTransaction,
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({
      message: "Failed to initiate withdrawal",
      error: error.message,
    });
  }
});
module.exports = router;
