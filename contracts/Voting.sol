// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IElection.sol";
import "./interfaces/IVoterRegistry.sol";

contract Voting {
    IElection public election;
    IVoterRegistry public registry;

    mapping(address => bool) public hasVoted;
    mapping(uint => uint) public voteTally;
    uint public totalVotesCast;

    event VoteCast(address indexed voter, uint indexed candidateId);

    constructor(address electionAddr, address registryAddr) {
        require(electionAddr != address(0), "Zero election address");
        require(registryAddr != address(0), "Zero registry address");
        election = IElection(electionAddr);
        registry = IVoterRegistry(registryAddr);
    }

    function castVote(uint candidateId) external {
        require(
            election.currentPhase() == IElection.Phase.VOTING,
            "Not VOTING phase"
        );
        require(registry.isRegistered(msg.sender), "Not registered");
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId < election.getCandidateCount(), "Invalid candidate");

        hasVoted[msg.sender] = true;
        voteTally[candidateId]++;
        totalVotesCast++;

        // Tell Election to increment the candidate's vote count
        election.incrementVote(candidateId);

        emit VoteCast(msg.sender, candidateId);
    }

    function getResults() external view returns (uint[] memory) {
        uint count = election.getCandidateCount();
        uint[] memory results = new uint[](count);
        for (uint i = 0; i < count; i++) {
            results[i] = voteTally[i];
        }
        return results;
    }
}
