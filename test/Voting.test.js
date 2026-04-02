const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let election, registry, voting;
  let admin, voter1, voter2, voter3, nonVoter;

  beforeEach(async function () {
    [admin, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();

    // Deploy Election
    const Election = await ethers.getContractFactory("Election");
    election = await Election.deploy();

    // Deploy VoterRegistry
    const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
    registry = await VoterRegistry.deploy(await election.getAddress());

    // Deploy Voting
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(
      await election.getAddress(),
      await registry.getAddress()
    );

    // Setup: add candidates
    await election.addCandidate("Alice");
    await election.addCandidate("Bob");
    await election.addCandidate("Carol");

    // Set voting contract on Election
    await election.setVotingContract(await voting.getAddress());

    // Advance to REGISTRATION phase and register voters
    await election.setPhase(1); // REGISTRATION
    await registry.registerVoter(voter1.address);
    await registry.registerVoter(voter2.address);
    await registry.registerVoter(voter3.address);

    // Advance to VOTING phase
    await election.setPhase(2); // VOTING
  });

  describe("castVote", function () {
    it("should allow registered voter to cast vote in VOTING phase", async function () {
      await voting.connect(voter1).castVote(0);
      expect(await voting.hasVoted(voter1.address)).to.equal(true);
    });

    it("should increment candidate tally", async function () {
      await voting.connect(voter1).castVote(0);
      expect(await voting.voteTally(0)).to.equal(1);
    });

    it("should increment totalVotesCast", async function () {
      await voting.connect(voter1).castVote(0);
      expect(await voting.totalVotesCast()).to.equal(1);
    });

    it("should increment vote on Election contract too", async function () {
      await voting.connect(voter1).castVote(0);
      const [, voteCount] = await election.getCandidate(0);
      expect(voteCount).to.equal(1);
    });

    it("should emit VoteCast event with correct args", async function () {
      await expect(voting.connect(voter1).castVote(0))
        .to.emit(voting, "VoteCast")
        .withArgs(voter1.address, 0);
    });

    it("should revert if voter has already voted (double vote)", async function () {
      await voting.connect(voter1).castVote(0);
      await expect(
        voting.connect(voter1).castVote(1)
      ).to.be.revertedWith("Already voted");
    });

    it("should revert if voter is not registered", async function () {
      await expect(
        voting.connect(nonVoter).castVote(0)
      ).to.be.revertedWith("Not registered");
    });

    it("should revert if not in VOTING phase", async function () {
      await election.setPhase(3); // ENDED
      await expect(
        voting.connect(voter1).castVote(0)
      ).to.be.revertedWith("Not VOTING phase");
    });

    it("should revert with invalid candidate id", async function () {
      await expect(
        voting.connect(voter1).castVote(99)
      ).to.be.revertedWith("Invalid candidate");
    });

    it("should allow multiple voters to vote for different candidates", async function () {
      await voting.connect(voter1).castVote(0); // Alice
      await voting.connect(voter2).castVote(1); // Bob
      await voting.connect(voter3).castVote(0); // Alice

      expect(await voting.voteTally(0)).to.equal(2); // Alice: 2
      expect(await voting.voteTally(1)).to.equal(1); // Bob: 1
      expect(await voting.voteTally(2)).to.equal(0); // Carol: 0
      expect(await voting.totalVotesCast()).to.equal(3);
    });
  });

  describe("getResults", function () {
    it("should return array of vote counts", async function () {
      await voting.connect(voter1).castVote(0);
      await voting.connect(voter2).castVote(1);

      const results = await voting.getResults();
      expect(results.length).to.equal(3);
      expect(results[0]).to.equal(1); // Alice
      expect(results[1]).to.equal(1); // Bob
      expect(results[2]).to.equal(0); // Carol
    });

    it("should return all zeros before any votes", async function () {
      const results = await voting.getResults();
      expect(results.length).to.equal(3);
      expect(results[0]).to.equal(0);
      expect(results[1]).to.equal(0);
      expect(results[2]).to.equal(0);
    });

    it("should return correct results after all voters vote", async function () {
      await voting.connect(voter1).castVote(2); // Carol
      await voting.connect(voter2).castVote(2); // Carol
      await voting.connect(voter3).castVote(0); // Alice

      const results = await voting.getResults();
      expect(results[0]).to.equal(1); // Alice
      expect(results[1]).to.equal(0); // Bob
      expect(results[2]).to.equal(2); // Carol
    });
  });

  describe("hasVoted", function () {
    it("should return false before voting", async function () {
      expect(await voting.hasVoted(voter1.address)).to.equal(false);
    });

    it("should return true after voting", async function () {
      await voting.connect(voter1).castVote(0);
      expect(await voting.hasVoted(voter1.address)).to.equal(true);
    });
  });
});
