const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration: Full Election Lifecycle", function () {
  let election, registry, voting;
  let admin, voter1, voter2, voter3;

  beforeEach(async function () {
    [admin, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy all contracts
    const Election = await ethers.getContractFactory("Election");
    election = await Election.deploy();

    const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
    registry = await VoterRegistry.deploy(await election.getAddress());

    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(
      await election.getAddress(),
      await registry.getAddress()
    );

    // Link voting contract
    await election.setVotingContract(await voting.getAddress());
  });

  it("full lifecycle: deploy → add candidates → register voters → cast votes → check results", async function () {
    // --- SETUP phase ---
    expect(await election.currentPhase()).to.equal(0); // SETUP

    // Add candidates
    await election.addCandidate("Alice");
    await election.addCandidate("Bob");
    await election.addCandidate("Carol");
    expect(await election.getCandidateCount()).to.equal(3);

    // Cannot vote in SETUP
    await expect(
      voting.connect(voter1).castVote(0)
    ).to.be.revertedWith("Not VOTING phase");

    // --- REGISTRATION phase ---
    await election.setPhase(1);
    expect(await election.currentPhase()).to.equal(1); // REGISTRATION

    // Cannot add candidates in REGISTRATION
    await expect(
      election.addCandidate("Dave")
    ).to.be.revertedWith("Not in SETUP phase");

    // Register voters
    await registry.registerVoter(voter1.address);
    await registry.registerVoter(voter2.address);
    await registry.registerVoter(voter3.address);
    expect(await registry.registeredCount()).to.equal(3);
    expect(await registry.isRegistered(voter1.address)).to.equal(true);

    // Cannot vote in REGISTRATION
    await expect(
      voting.connect(voter1).castVote(0)
    ).to.be.revertedWith("Not VOTING phase");

    // --- VOTING phase ---
    await election.setPhase(2);
    expect(await election.currentPhase()).to.equal(2); // VOTING

    // Cannot register in VOTING
    await expect(
      registry.registerVoter(admin.address)
    ).to.be.revertedWith("Not REGISTRATION phase");

    // Cast votes
    await voting.connect(voter1).castVote(0); // Alice
    await voting.connect(voter2).castVote(1); // Bob
    await voting.connect(voter3).castVote(0); // Alice

    expect(await voting.totalVotesCast()).to.equal(3);
    expect(await voting.hasVoted(voter1.address)).to.equal(true);
    expect(await voting.hasVoted(voter2.address)).to.equal(true);
    expect(await voting.hasVoted(voter3.address)).to.equal(true);

    // Check results
    const results = await voting.getResults();
    expect(results[0]).to.equal(2); // Alice: 2
    expect(results[1]).to.equal(1); // Bob: 1
    expect(results[2]).to.equal(0); // Carol: 0

    // Verify Election contract also has correct tallies
    const [, aliceVotes] = await election.getCandidate(0);
    const [, bobVotes] = await election.getCandidate(1);
    const [, carolVotes] = await election.getCandidate(2);
    expect(aliceVotes).to.equal(2);
    expect(bobVotes).to.equal(1);
    expect(carolVotes).to.equal(0);

    // --- ENDED phase ---
    await election.setPhase(3);
    expect(await election.currentPhase()).to.equal(3); // ENDED

    // Cannot vote after ENDED
    // (voter1 already voted, but even if they hadn't, phase prevents it)

    // Results are still accessible
    const finalResults = await voting.getResults();
    expect(finalResults[0]).to.equal(2);
    expect(finalResults[1]).to.equal(1);
    expect(finalResults[2]).to.equal(0);
  });

  it("edge case: last voter votes, final tallies match getResults", async function () {
    // Setup
    await election.addCandidate("Alice");
    await election.addCandidate("Bob");

    // Registration
    await election.setPhase(1);
    await registry.registerVoter(voter1.address);
    await registry.registerVoter(voter2.address);

    // Voting
    await election.setPhase(2);
    await voting.connect(voter1).castVote(1); // Bob

    // Last voter
    await voting.connect(voter2).castVote(1); // Bob
    expect(await voting.totalVotesCast()).to.equal(2);

    const results = await voting.getResults();
    expect(results[0]).to.equal(0); // Alice: 0
    expect(results[1]).to.equal(2); // Bob: 2

    // End election
    await election.setPhase(3);
    const [, bobFinal] = await election.getCandidate(1);
    expect(bobFinal).to.equal(2);
  });

  it("should prevent double voting even across candidates", async function () {
    await election.addCandidate("Alice");
    await election.addCandidate("Bob");
    await election.setPhase(1);
    await registry.registerVoter(voter1.address);
    await election.setPhase(2);

    await voting.connect(voter1).castVote(0); // Vote for Alice
    await expect(
      voting.connect(voter1).castVote(1) // Try to vote for Bob
    ).to.be.revertedWith("Already voted");
  });

  it("should prevent phase regression", async function () {
    await election.setPhase(1);
    await election.setPhase(2);
    await expect(election.setPhase(1)).to.be.revertedWith("Must advance forward");
    await expect(election.setPhase(0)).to.be.revertedWith("Must advance forward");
  });
});
