# Lido Assistant

## Introduction

The **Lido Assistant** is an AI-powered assistant designed to help users perform various blockchain-related tasks by interacting with the **Lido AI Assistant APIs**. This solution simplifies Ethereum staking, provides staking analytics, and ensures a seamless user experience.

[![Demo](https://img.shields.io/badge/Demo-Visit%20Demo-brightgreen)](https://tinyurl.com/lido-bitte-assistant)
[![Deploy](https://img.shields.io/badge/Deploy-on%20Vercel-blue)](https://vercel.com/new/clone?repository-url=https://github.com/Teckas-Technologies/lido-bitte-agent)

**Tooling:**

[![Use Case](https://img.shields.io/badge/Use%20Case-ETH%20Staking%20Simplification-orange)](#)
[![Tools](https://img.shields.io/badge/Tools-web3.js%2C%20ethers.js-blue)](#)
[![Framework](https://img.shields.io/badge/Framework-Node.js-blue)](#)

**Author:**

[![Author](https://img.shields.io/badge/Follow-Teckas%20Technologies-blue?style=social&logo=linkedin)](https://www.linkedin.com/company/teckas/) [![Organization](https://img.shields.io/badge/Teckas%20Technologies-blue)](https://teckastechnologies.com/)

## Key Features

- **ETH Staking Assistance**: Guide users through ETH staking, including rewards, risks, and mechanics of staked ETH.
- **Real-Time Staking APR Retrieval**: Fetch and display the latest stETH APR.
- **SMA (Simple Moving Average) APR Calculation**: Provide historical APR trends over a specified number of days.
- **User-Friendly Blockchain Interactions**: Ensure seamless staking transactions and provide clear blockchain explanations.
- **Balance Retrieval**: Fetch and display users' ETH balance in an easy-to-read format.

## User Flow

1. **ETH Staking Assistance:**  
   - Explain staking rewards, risks, and mechanisms.
   - Call the `generate-evm-tx` tool when all transaction details are provided.
   - **Endpoint**: GET /api/stake/stake
   - **Response**: Returns staking confirmation details.

2. **Retrieve Latest stETH APR:**  
   - Fetch the most recent staking APR for stETH.
   - **Endpoint**: GET /api/statistics/apr/last
   - **Response**: Returns the current APR percentage.

3. **Calculate SMA APR for stETH:**  
   - Provide historical APR trends over a specified period.
   - **Endpoint**: GET /api/statistics/apr/sma
   - **Parameters**:
     - days (integer): The number of days for the moving average calculation.
   - **Response**: Returns the average APR over the given period.

4. **Fetch ETH Balance:**  
   - Retrieve and display the user's ETH balance.
   - **Endpoint**: GET /api/balance/balance
   - **Parameters**:
     - walletAddress (string): The EVM wallet address of the user.
   - **Response**: Returns an object containing the ETH balance.

## Conclusion

The **Lido Assistant** simplifies Ethereum staking by providing users with seamless access to staking analytics and interactions through Lido AI APIs. It enhances user experience by offering real-time staking insights, balance retrieval, and detailed blockchain explanations. Contributions and feedback are welcome to further refine the assistant's functionalities.

## Step By Step

To get started with **Lido Assistant**, follow these steps:

1. **Clone the repository**
```bash
git clone https://github.com/Teckas-Technologies/lido-bitte-agent
cd lido-bitte-agent
```
2. **Install dependencies**
```bash
npm install
npm run start
```

## Usage

This assistant utilizes the **Lido AI Assistant APIs** to fetch staking-related data and facilitate ETH staking operations.

## Deployment

Follow these steps to deploy the **Lido Assistant** on Vercel:
- **Create an Account**: Sign up for an account on Vercel.
- **Connect GitHub**: Connect your GitHub account with Vercel.
- **Import Repository**: Import the GitHub repository of the project.
- **Add Environment Variables**: While configuring the project, add the necessary environment variables.
- **Deploy**: Click the deploy button.
- **Access Application**: Once the deployment is complete, you can access your application.

