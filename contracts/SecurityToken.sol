// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IdentityRegistry} from "./IdentityRegistry.sol";

/// @title SecurityToken
/// @notice ERC-20-like security token with whitelist-gated transfers (ERC-3643 style).
/// @dev This is a scaffold for audit-ready development — not production-audited.
contract SecurityToken {
    string public name;
    string public symbol;
    uint8 public immutable decimals = 18;
    uint256 public totalSupply;
    uint256 public mintedSupply;

    address public owner;
    IdentityRegistry public identityRegistry;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => bool) public whitelist;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Whitelisted(address indexed wallet, bool allowed);
    event Minted(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
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
        owner = msg.sender;
        identityRegistry = IdentityRegistry(identityRegistry_);
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address tokenOwner, address spender) external view returns (uint256) {
        return _allowances[tokenOwner][spender];
    }

    function setWhitelisted(address wallet, bool allowed) external onlyOwner {
        whitelist[wallet] = allowed;
        emit Whitelisted(wallet, allowed);
    }

    function mint(address to, uint256 amount) external onlyOwner {
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
}
