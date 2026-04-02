const { ethers } = require("hardhat");
async function main() {
  const [admin] = await ethers.getSigners();
  console.log("Admin address:", admin.address);
  
  const Election = await ethers.getContractFactory("Election");
  const electionAddr = require("../frontend/src/config/contracts").CONTRACT_ADDRESSES.ELECTION;
  const election = Election.attach(electionAddr);
  
  const currentPhase = await election.currentPhase();
  console.log("Current phase:", currentPhase.toString());
  
  try {
    const tx = await election.addCandidate("Test Candidate");
    await tx.wait();
    console.log("Candidate added successfully!");
  } catch (e) {
    console.error("Error adding candidate:", e);
  }
}
main().catch(console.error);
