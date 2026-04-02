const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoterRegistry", function () {
  let election, registry;
  let admin, voter1, voter2, other;

  beforeEach(async function () {
    [admin, voter1, voter2, other] = await ethers.getSigners();

    const Election = await ethers.getContractFactory("Election");
    election = await Election.deploy();

    const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
    registry = await VoterRegistry.deploy(await election.getAddress());

    // Advance to REGISTRATION phase
    await election.setPhase(1);
  });

  describe("Deployment", function () {
    it("should set deployer as admin", async function () {
      expect(await registry.admin()).to.equal(admin.address);
    });

    it("should start with 0 registered voters", async function () {
      expect(await registry.registeredCount()).to.equal(0);
    });
  });

  describe("registerVoter", function () {
    it("should allow admin to register a voter", async function () {
      await registry.registerVoter(voter1.address);
      expect(await registry.isRegistered(voter1.address)).to.equal(true);
      expect(await registry.registeredCount()).to.equal(1);
    });

    it("should emit VoterRegistered event", async function () {
      await expect(registry.registerVoter(voter1.address))
        .to.emit(registry, "VoterRegistered")
        .withArgs(voter1.address);
    });

    it("should register multiple voters", async function () {
      await registry.registerVoter(voter1.address);
      await registry.registerVoter(voter2.address);
      expect(await registry.registeredCount()).to.equal(2);
    });

    it("should revert if non-admin tries to register", async function () {
      await expect(
        registry.connect(other).registerVoter(voter1.address)
      ).to.be.revertedWith("Not admin");
    });

    it("should revert if voter already registered", async function () {
      await registry.registerVoter(voter1.address);
      await expect(
        registry.registerVoter(voter1.address)
      ).to.be.revertedWith("Already registered");
    });

    it("should revert if not in REGISTRATION phase", async function () {
      await election.setPhase(2); // VOTING
      await expect(
        registry.registerVoter(voter1.address)
      ).to.be.revertedWith("Not REGISTRATION phase");
    });

    it("should revert with zero address", async function () {
      await expect(
        registry.registerVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });
  });

  describe("revokeVoter", function () {
    beforeEach(async function () {
      await registry.registerVoter(voter1.address);
    });

    it("should allow admin to revoke a voter", async function () {
      await registry.revokeVoter(voter1.address);
      expect(await registry.isRegistered(voter1.address)).to.equal(false);
      expect(await registry.registeredCount()).to.equal(0);
    });

    it("should emit VoterRevoked event", async function () {
      await expect(registry.revokeVoter(voter1.address))
        .to.emit(registry, "VoterRevoked")
        .withArgs(voter1.address);
    });

    it("should revert if non-admin tries to revoke", async function () {
      await expect(
        registry.connect(other).revokeVoter(voter1.address)
      ).to.be.revertedWith("Not admin");
    });

    it("should revert if voter not registered", async function () {
      await expect(
        registry.revokeVoter(voter2.address)
      ).to.be.revertedWith("Not registered");
    });
  });

  describe("isRegistered", function () {
    it("should return false for unregistered address", async function () {
      expect(await registry.isRegistered(voter1.address)).to.equal(false);
    });

    it("should return true after registration", async function () {
      await registry.registerVoter(voter1.address);
      expect(await registry.isRegistered(voter1.address)).to.equal(true);
    });

    it("should return false after revocation", async function () {
      await registry.registerVoter(voter1.address);
      await registry.revokeVoter(voter1.address);
      expect(await registry.isRegistered(voter1.address)).to.equal(false);
    });
  });
});
