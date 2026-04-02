const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../frontend/src/config/contracts.js");
const configContent = fs.readFileSync(configPath, "utf-8");
const jsonMatch = configContent.match(/export const CONTRACT_ADDRESSES = ({[\s\S]*?});/);
const CONTRACT_ADDRESSES = JSON.parse(jsonMatch[1]);

async function main() {
    const voterAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    
    const Election = await ethers.getContractFactory("Election");
    const election = await Election.attach(CONTRACT_ADDRESSES.ELECTION);

    const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
    const registry = await VoterRegistry.attach(CONTRACT_ADDRESSES.VOTER_REGISTRY);

    console.log("Seeding candidates...");
    await election.addCandidate("Alice Blue");
    await election.addCandidate("Bob Green");
    await election.addCandidate("Charlie Red");

    console.log("Advancing to REGISTRATION...");
    await election.setPhase(1);

    console.log("Whitelisting voter:", voterAddress);
    await registry.registerVoter(voterAddress);

    console.log("Advancing to VOTING...");
    await election.setPhase(2);

    console.log("Complete! The election is now in the VOTING phase and your address is whitelisted.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
