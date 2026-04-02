const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election", function () {
  let election;
  let admin, other;

  beforeEach(async function () {
    [admin, other] = await ethers.getSigners();
    const Election = await ethers.getContractFactory("Election");
    election = await Election.deploy();
  });

  describe("Deployment", function () {
    it("should set deployer as admin", async function () {
      expect(await election.admin()).to.equal(admin.address);
    });

    it("should start in SETUP phase", async function () {
      expect(await election.currentPhase()).to.equal(0); // SETUP
    });

    it("should start with 0 candidates", async function () {
      expect(await election.getCandidateCount()).to.equal(0);
    });
  });

  describe("addCandidate", function () {
    it("should allow admin to add a candidate in SETUP", async function () {
      await election.addCandidate("Alice");
      expect(await election.getCandidateCount()).to.equal(1);
      const [name, voteCount] = await election.getCandidate(0);
      expect(name).to.equal("Alice");
      expect(voteCount).to.equal(0);
    });

    it("should emit CandidateAdded event", async function () {
      await expect(election.addCandidate("Alice"))
        .to.emit(election, "CandidateAdded")
        .withArgs(0, "Alice");
    });

    it("should add multiple candidates", async function () {
      await election.addCandidate("Alice");
      await election.addCandidate("Bob");
      await election.addCandidate("Carol");
      expect(await election.getCandidateCount()).to.equal(3);
    });

    it("should revert if non-admin tries to add candidate", async function () {
      await expect(
        election.connect(other).addCandidate("Alice")
      ).to.be.revertedWith("Not admin");
    });

    it("should revert if not in SETUP phase", async function () {
      await election.setPhase(1); // REGISTRATION
      await expect(election.addCandidate("Alice")).to.be.revertedWith(
        "Not in SETUP phase"
      );
    });

    it("should revert with empty name", async function () {
      await expect(election.addCandidate("")).to.be.revertedWith("Empty name");
    });
  });

  describe("setPhase", function () {
    it("should advance phase forward by one", async function () {
      await election.setPhase(1); // SETUP -> REGISTRATION
      expect(await election.currentPhase()).to.equal(1);
    });

    it("should emit PhaseChanged event", async function () {
      await expect(election.setPhase(1))
        .to.emit(election, "PhaseChanged")
        .withArgs(1);
    });

    it("should advance through all phases sequentially", async function () {
      await election.setPhase(1); // REGISTRATION
      await election.setPhase(2); // VOTING
      await election.setPhase(3); // ENDED
      expect(await election.currentPhase()).to.equal(3);
    });

    it("should revert if non-admin tries to change phase", async function () {
      await expect(
        election.connect(other).setPhase(1)
      ).to.be.revertedWith("Not admin");
    });

    it("should revert if skipping a phase", async function () {
      await expect(election.setPhase(2)).to.be.revertedWith(
        "Must advance forward"
      );
    });

    it("should revert if going backwards", async function () {
      await election.setPhase(1);
      await expect(election.setPhase(0)).to.be.revertedWith(
        "Must advance forward"
      );
    });
  });

  describe("getCandidate", function () {
    it("should revert for invalid candidate id", async function () {
      await expect(election.getCandidate(0)).to.be.revertedWith(
        "Invalid candidate"
      );
    });

    it("should return correct candidate data", async function () {
      await election.addCandidate("Alice");
      const [name, voteCount] = await election.getCandidate(0);
      expect(name).to.equal("Alice");
      expect(voteCount).to.equal(0);
    });
  });

  describe("setVotingContract", function () {
    it("should allow admin to set voting contract", async function () {
      await election.setVotingContract(other.address);
      expect(await election.votingContract()).to.equal(other.address);
    });

    it("should revert if called twice", async function () {
      await election.setVotingContract(other.address);
      await expect(
        election.setVotingContract(admin.address)
      ).to.be.revertedWith("Voting contract already set");
    });

    it("should revert if non-admin calls", async function () {
      await expect(
        election.connect(other).setVotingContract(other.address)
      ).to.be.revertedWith("Not admin");
    });

    it("should revert with zero address", async function () {
      await expect(
        election.setVotingContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });
  });

  describe("incrementVote", function () {
    it("should revert if caller is not voting contract", async function () {
      await election.addCandidate("Alice");
      await expect(election.incrementVote(0)).to.be.revertedWith(
        "Only voting contract"
      );
    });
  });
});
