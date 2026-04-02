// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVoterRegistry {
    function isRegistered(address voter) external view returns (bool);
}
