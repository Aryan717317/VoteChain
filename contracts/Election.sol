// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Election {
    enum Phase { SETUP, REGISTRATION, VOTING, ENDED }

    address public admin;
    Phase public currentPhase;

    // Voting contract address — restricted caller for incrementVote
    address public votingContract;
    bool private votingContractSet;

    struct Candidate {
        string name;
        uint voteCount;
    }
    Candidate[] private candidates;

    event PhaseChanged(Phase newPhase);
    event CandidateAdded(uint indexed id, string name);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        currentPhase = Phase.SETUP;
    }

    /// @notice Register the Voting contract address. Can only be called once.
    function setVotingContract(address _votingContract) external onlyAdmin {
        require(!votingContractSet, "Voting contract already set");
        require(_votingContract != address(0), "Zero address");
        votingContract = _votingContract;
        votingContractSet = true;
    }

    function addCandidate(string memory name) external onlyAdmin {
        require(currentPhase == Phase.SETUP || currentPhase == Phase.REGISTRATION, "Not in SETUP or REGISTRATION phase");
        require(bytes(name).length > 0, "Empty name");
        candidates.push(Candidate(name, 0));
        emit CandidateAdded(candidates.length - 1, name);
    }

    function setPhase(Phase newPhase) external onlyAdmin {
        require(uint(newPhase) == uint(currentPhase) + 1, "Must advance forward");
        currentPhase = newPhase;
        emit PhaseChanged(newPhase);
    }

    /// @notice Reset the election phase to SETUP (only for admin/testing)
    function resetPhase() external onlyAdmin {
        currentPhase = Phase.SETUP;
        emit PhaseChanged(Phase.SETUP);
    }

    function getCandidateCount() external view returns (uint) {
        return candidates.length;
    }

    function getCandidate(uint id) external view returns (string memory name, uint voteCount) {
        require(id < candidates.length, "Invalid candidate");
        return (candidates[id].name, candidates[id].voteCount);
    }

    /// @notice Increment vote count for a candidate. Only callable by the Voting contract.
    function incrementVote(uint id) external {
        require(msg.sender == votingContract, "Only voting contract");
        require(id < candidates.length, "Invalid candidate");
        candidates[id].voteCount++;
    }
}
