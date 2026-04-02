// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IElection.sol";

contract VoterRegistry {
    address public admin;
    IElection public election;

    mapping(address => bool) public registeredVoters;
    uint public registeredCount;

    event VoterRegistered(address indexed voter);
    event VoterRevoked(address indexed voter);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address electionAddr) {
        require(electionAddr != address(0), "Zero address");
        admin = msg.sender;
        election = IElection(electionAddr);
    }

    function registerVoter(address voter) external onlyAdmin {
        require(
            election.currentPhase() == IElection.Phase.REGISTRATION,
            "Not REGISTRATION phase"
        );
        require(voter != address(0), "Zero address");
        require(!registeredVoters[voter], "Already registered");
        registeredVoters[voter] = true;
        registeredCount++;
        emit VoterRegistered(voter);
    }

    function revokeVoter(address voter) external onlyAdmin {
        require(registeredVoters[voter], "Not registered");
        registeredVoters[voter] = false;
        registeredCount--;
        emit VoterRevoked(voter);
    }

    function isRegistered(address voter) external view returns (bool) {
        return registeredVoters[voter];
    }
}
