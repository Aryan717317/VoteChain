const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Election
  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy();
  await election.waitForDeployment();
  console.log("Election deployed to:", await election.getAddress());

  // 2. VoterRegistry
  const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
  const registry = await VoterRegistry.deploy(await election.getAddress());
  await registry.waitForDeployment();
  console.log("VoterRegistry deployed to:", await registry.getAddress());

  // 3. Voting
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(
    await election.getAddress(),
    await registry.getAddress()
  );
  await voting.waitForDeployment();
  console.log("Voting deployed to:", await voting.getAddress());

  // 4. Set voting contract on Election
  await election.setVotingContract(await voting.getAddress());
  console.log("Voting contract registered on Election");

  // 5. Write addresses to frontend config
  const config = {
    ELECTION: await election.getAddress(),
    VOTER_REGISTRY: await registry.getAddress(),
    VOTING: await voting.getAddress(),
    NETWORK_ID: (await ethers.provider.getNetwork()).chainId.toString(),
  };

  const configPath = path.join(__dirname, "../frontend/src/config/contracts.js");
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(
    configPath,
    `export const CONTRACT_ADDRESSES = ${JSON.stringify(config, null, 2)};\n`
  );
  console.log("Contract addresses written to frontend/src/config/contracts.js");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
