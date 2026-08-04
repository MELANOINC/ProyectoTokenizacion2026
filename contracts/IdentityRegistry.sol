// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IdentityRegistry
/// @notice KYC / identity registry with admin + compliance roles.
/// @dev Not production-audited. Integrate a regulated KYC provider before mainnet capital.
contract IdentityRegistry {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(address => bool) public verified;
    mapping(address => string) public country;

    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);
    event IdentityRegistered(address indexed wallet, string countryCode);
    event IdentityRevoked(address indexed wallet);
    event ComplianceDecision(address indexed wallet, bool approved, string reason);

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "NOT_AUTHORIZED");
        _;
    }

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    function grantRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "ZERO_ADDRESS");
        _roles[role][account] = false;
        emit RoleRevoked(role, account);
    }

    function registerIdentity(
        address wallet,
        string calldata countryCode
    ) external onlyRole(COMPLIANCE_ROLE) {
        require(wallet != address(0), "ZERO_ADDRESS");
        verified[wallet] = true;
        country[wallet] = countryCode;
        emit IdentityRegistered(wallet, countryCode);
        emit ComplianceDecision(wallet, true, "registered");
    }

    function revokeIdentity(address wallet) external onlyRole(COMPLIANCE_ROLE) {
        verified[wallet] = false;
        delete country[wallet];
        emit IdentityRevoked(wallet);
        emit ComplianceDecision(wallet, false, "revoked");
    }

    function isVerified(address wallet) external view returns (bool) {
        return verified[wallet];
    }

    function _grantRole(bytes32 role, address account) internal {
        require(account != address(0), "ZERO_ADDRESS");
        _roles[role][account] = true;
        emit RoleGranted(role, account);
    }
}
