// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IdentityRegistry
/// @notice Minimal identity / KYC registry used by NOTORIUS security tokens.
/// @dev Production deployments should integrate a regulated KYC provider and
///      follow ERC-3643 identity patterns (ONCHAINID or equivalent).
///      Roles: ADMIN manages grants; COMPLIANCE registers/revokes identities.
contract IdentityRegistry {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    /// @notice Primary admin address (backward-compatible alias for the deployer/admin).
    address public owner;

    mapping(bytes32 => mapping(address => bool)) public roles;
    mapping(address => bool) public verified;
    mapping(address => string) public country;

    event IdentityRegistered(address indexed wallet, string countryCode);
    event IdentityRevoked(address indexed wallet);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyRole(bytes32 role) {
        require(roles[role][msg.sender], "MISSING_ROLE");
        _;
    }

    constructor() {
        owner = msg.sender;
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
    }

    function hasRole(bytes32 role, address account) external view returns (bool) {
        return roles[role][account];
    }

    function grantRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        require(account != address(0), "ZERO_ADDRESS");
        require(role == ADMIN_ROLE || role == COMPLIANCE_ROLE, "UNKNOWN_ROLE");
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        require(role == ADMIN_ROLE || role == COMPLIANCE_ROLE, "UNKNOWN_ROLE");
        require(!(role == ADMIN_ROLE && account == owner), "REVOKE_OWNER");
        _revokeRole(role, account);
    }

    function transferOwnership(address newOwner) external onlyRole(ADMIN_ROLE) {
        require(newOwner != address(0), "ZERO_ADDRESS");
        address previous = owner;
        _grantRole(ADMIN_ROLE, newOwner);
        _revokeRole(ADMIN_ROLE, previous);
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    function registerIdentity(address wallet, string calldata countryCode)
        external
        onlyRole(COMPLIANCE_ROLE)
    {
        require(wallet != address(0), "ZERO_ADDRESS");
        verified[wallet] = true;
        country[wallet] = countryCode;
        emit IdentityRegistered(wallet, countryCode);
    }

    function revokeIdentity(address wallet) external onlyRole(COMPLIANCE_ROLE) {
        verified[wallet] = false;
        delete country[wallet];
        emit IdentityRevoked(wallet);
    }

    function isVerified(address wallet) external view returns (bool) {
        return verified[wallet];
    }

    function _grantRole(bytes32 role, address account) internal {
        if (!roles[role][account]) {
            roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function _revokeRole(bytes32 role, address account) internal {
        if (roles[role][account]) {
            roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}
