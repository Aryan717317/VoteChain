const { ethers } = require("hardhat");

async function main() {
  const [admin, voter1, voter2, voter3] = await ethers.getSigners();
  console.log("Seeding with admin:", admin.address);

  // Get deployed contract addresses from the config (which deploy.js wrote)
  const configPath = "../frontend/src/config/contracts.js";
  const fs = require("fs");
  const path = require("path");
  const fullPath = path.join(__dirname, configPath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error("Contracts config not found! Run deploy.js first.");
  }
  
  const content = fs.readFileSync(fullPath, "utf8");
  const jsonStr = content.replace("export const CONTRACT_ADDRESSES = ", "").replace(";\n", "");
  const addresses = JSON.parse(jsonStr);

  const election = await ethers.getContractAt("Election", addresses.ELECTION);
  const registry = await ethers.getContractAt("VoterRegistry", addresses.VOTER_REGISTRY);

  // 1. Add 3 candidates (we are in SETUP phase by default after deploy)
  console.log("Adding candidates...");
  await election.addCandidate("Alice");
  await election.addCandidate("Bob");
  await election.addCandidate("Carol");
  console.log("Added Alice, Bob, Carol");

  // 2. Advance to REGISTRATION phase
  console.log("Advancing to REGISTRATION phase...");
  await election.setPhase(1);

  // 3. Register test voters
  console.log("Registering test voters...");
  await registry.registerVoter(voter1.address);
  console.log("- Registered Voter 1:", voter1.address);
  await registry.registerVoter(voter2.address);
  console.log("- Registered Voter 2:", voter2.address);
  await registry.registerVoter(voter3.address);
  console.log("- Registered Voter 3:", voter3.address);

  // 4. Advance to VOTING phase
  console.log("Advancing to VOTING phase...");
  await election.setPhase(2);

  console.log("Seeding complete! Election is now active.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
