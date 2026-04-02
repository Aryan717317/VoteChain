# VoteChain — Decentralized Voting System

A tamper-proof election dApp built on Ethereum. Registered voters cast one
vote each; results are transparent and permanently on-chain.

## Live Demo
[Deployment Link pending / to be added]

## Contract Addresses (Sepolia)
*Pending Sepolia Deployment*
- Election: `0x...`
- VoterRegistry: `0x...`
- Voting: `0x...`

## Tech Stack
Solidity 0.8.24 · Hardhat · React 18 · ethers.js v6 · Tailwind CSS 3 · Recharts

## Local Setup
```bash
npm install
cp .env.example .env   # fill in your keys
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/seed.js --network localhost
cd frontend && npm install && npm run dev
```

## Running Tests
```bash
npx hardhat test
npx hardhat coverage
```
