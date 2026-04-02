// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IElection {
    enum Phase { SETUP, REGISTRATION, VOTING, ENDED }
    function currentPhase() external view returns (Phase);
    function getCandidateCount() external view returns (uint);
    function getCandidate(uint id) external view returns (string memory name, uint voteCount);
    function admin() external view returns (address);
    function incrementVote(uint id) external;
}
