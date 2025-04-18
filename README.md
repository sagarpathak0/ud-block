
# DeFi Platform with GNN Fraud Detection

A comprehensive financial technology solution consisting of a decentralized finance platform built on Ethereum and a Graph Neural Network-based payment fraud detection system.

## Project Overview

This project combines two cutting-edge financial technology implementations:

1. **DeFi Platform**: A full-stack Ethereum application providing budget management, peer-to-peer lending, and micro-investment services.
2. **GNN Fraud Detection**: A graph neural network system that analyzes payment transaction patterns to detect fraudulent activities in real-time.

## Table of Contents

- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Frontend](#frontend)
- [GNN Fraud Detection](#gnn-fraud-detection)
- [Installation](#installation)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Architecture

### DeFi Platform Architecture

┌─────────────┐ ┌─────────────┐ │ React UI │◄────┤ User's │ │ (Vercel) │ │ Wallet │ └──────┬──────┘ └─────────────┘ │ ▼ ┌──────────────┐ │ ethers.js │ └──────┬───────┘ │ ▼ ┌─────────────────────────────────────┐ │ Ethereum Blockchain │ │ │ │ ┌────────────┐ ┌─────────────┐ │ │ │ Budget │ │ Micro │ │ │ │ Manager │ │ Lending │ │ │ └────────────┘ └─────────────┘ │ │ │ │ ┌────────────┐ ┌─────────────┐ │ │ │ Micro │ │ Test │ │ │ │ Investor │ │ Token │ │ │ └────────────┘ └─────────────┘ │ └─────────────────────────────────────┘



### GNN Fraud Detection Architecture

┌───────────────┐ ┌───────────────┐ │ Transaction │────▶│ Graph Builder │ │ Data │ └───────┬───────┘ └───────────────┘ │ ▼ ┌───────────────┐ │ Node & Edge │ │ Features │ └───────┬───────┘ │ ▼ ┌───────────────┐ │ Graph Neural │ │ Network │ └───────┬───────┘ │ ▼ ┌───────────────┐ │ Risk Scoring │ │ Engine │ └───────┬───────┘ │ ▼ ┌───────────────┐ │ Alerts & │ │ Monitoring │ └───────────────┘



## Smart Contracts

The DeFi platform consists of four main smart contracts:

### BudgetManager

- Personal financial management
- Create, track, and manage budgets
- Monitor expenses against budgets

### MicroLending

- Peer-to-peer lending marketplace
- Offer and take loans with customizable terms
- Automatic credit scoring based on repayment history

### MicroInvestor

- Pooled micro-investment platform
- Deposit funds to earn yields
- Proportional distribution of returns

### TestToken

- ERC20 token implementation
- Powers all transactions on the platform
- Includes faucet functionality for testing

## Frontend

The frontend is built with React and uses:

- Material-UI for component design
- ethers.js for blockchain interaction
- React Router for navigation
- React Context for state management

Features include:

- Wallet connection with MetaMask
- Dashboard with financial overview
- Budget creation and tracking
- Lending marketplace interface
- Investment portal

## GNN Fraud Detection

The Graph Neural Network-based fraud detection system models payment transactions as a graph where accounts are nodes and payments are edges. It identifies suspicious patterns that may indicate fraud.

### Core Components:

- **Graph Construction**: Converts transaction data into graph structure
- **Feature Engineering**: Extracts node and edge features
- **GNN Model**: Multi-layer graph neural network with attention mechanisms
- **Anomaly Detection**: Identifies unusual patterns in transaction flows
- **Risk Scoring**: Assigns risk scores to transactions

### Detected Fraud Patterns:

- Circular payment loops
- Smurfing (breaking large amounts into smaller transactions)
- Sudden changes in transaction behavior
- Unusual cross-account interactions

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Python 3.8+ (for GNN)
- MetaMask browser extension

### DeFi Platform Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/defi-platform.git
cd defi-platform

# Install dependencies
cd frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your contract addresses
```
