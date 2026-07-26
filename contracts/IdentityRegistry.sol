// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IdentityRegistry
/// @notice Minimal identity / KYC registry used by NOTORIUS security tokens.
/// @dev Production deployments should integrate a regulated KYC provider and
///      follow ERC-3643 identity patterns (ONCHAINID or equivalent).
contract IdentityRegistry {
    address public owner;

    mapping(address => bool) public verified;
    mapping(address => string) public country;

    event IdentityRegistered(address indexed wallet, string countryCode);
    event IdentityRevoked(address indexed wallet);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerIdentity(address wallet, string calldata countryCode) external onlyOwner {
        require(wallet != address(0), "ZERO_ADDRESS");
        verified[wallet] = true;
        country[wallet] = countryCode;
        emit IdentityRegistered(wallet, countryCode);
    }

    function revokeIdentity(address wallet) external onlyOwner {
        verified[wallet] = false;
        delete country[wallet];
        emit IdentityRevoked(wallet);
    }

    function isVerified(address wallet) external view returns (bool) {
        return verified[wallet];
    }
}
