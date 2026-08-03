// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IdentityRegistry} from "./IdentityRegistry.sol";

/// @title SecurityToken
/// @notice Whitelist-gated security token with admin / compliance / issuer roles.
/// @dev ERC-3643-style scaffold — not production-audited.
contract SecurityToken {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    string public name;
    string public symbol;
    uint8 public immutable decimals = 18;
    uint256 public totalSupply;
    uint256 public mintedSupply;

    IdentityRegistry public identityRegistry;
    mapping(bytes32 => mapping(address => bool)) private _roles;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) public whitelist;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Whitelisted(address indexed wallet, bool allowed);
    event Minted(address indexed to, uint256 amount);
    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);
    event ComplianceDecision(address indexed wallet, bool allowed, string reason);

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "NOT_AUTHORIZED");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        address identityRegistry_
    ) {
        require(identityRegistry_ != address(0), "ZERO_REGISTRY");
        name = name_;
        symbol = symbol_;
        totalSupply = totalSupply_;
        identityRegistry = IdentityRegistry(identityRegistry_);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
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

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address tokenOwner, address spender) external view returns (uint256) {
        return _allowances[tokenOwner][spender];
    }

    function setWhitelisted(address wallet, bool allowed) external onlyRole(COMPLIANCE_ROLE) {
        whitelist[wallet] = allowed;
        emit Whitelisted(wallet, allowed);
        emit ComplianceDecision(wallet, allowed, allowed ? "whitelisted" : "revoked");
    }

    function mint(address to, uint256 amount) external onlyRole(ISSUER_ROLE) {
        require(whitelist[to], "NOT_WHITELISTED");
        require(identityRegistry.isVerified(to), "NOT_KYC");
        require(mintedSupply + amount <= totalSupply, "EXCEEDS_SUPPLY");

        mintedSupply += amount;
        _balances[to] += amount;
        emit Minted(to, amount);
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = _allowances[from][msg.sender];
        require(allowed >= amount, "ALLOWANCE");
        _allowances[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0) && to != address(0), "ZERO_ADDRESS");
        require(whitelist[from] && whitelist[to], "NOT_WHITELISTED");
        require(identityRegistry.isVerified(from) && identityRegistry.isVerified(to), "NOT_KYC");
        require(_balances[from] >= amount, "BALANCE");

        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _grantRole(bytes32 role, address account) internal {
        require(account != address(0), "ZERO_ADDRESS");
        _roles[role][account] = true;
        emit RoleGranted(role, account);
    }
}
