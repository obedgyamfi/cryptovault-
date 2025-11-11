// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CryptoVault
 * @notice A simple ETH vault that lets users deposit, withdraw, and view balances.
 * @dev Demonstrates secure Solidity patterns for beginner-to-intermediate developers.
 */
contract Vault {
    mapping(address => uint256) private balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    /**
     * @notice Deposit ETH into the vault.
     * @dev Amount is automatically available via msg.value.
     */
    function deposit() external payable {
        require(msg.value > 0, "Deposit must be greater than 0");

        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw specified amount of ETH from the vault.
     * @param amount The amount of ETH to withdraw.
     */
    function withdraw(uint256 amount) external {
        uint256 userBalance = balances[msg.sender];
        require(amount > 0, "Amount must be greater than 0");
        require(userBalance >= amount, "Insufficient balance");

        // Checks-Effects-Interactions pattern
        balances[msg.sender] = userBalance - amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Returns the balance of a user.
     * @param user Address to query balance for.
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    /**
     * @notice Returns the total ETH held by the vault.
     */
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
