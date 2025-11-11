// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Vault
 * @dev A simple vault contract for depositing and withdrawing ETH
 * @notice Users can deposit ETH and withdraw their balance
 */
contract Vault {
    // Mapping to track user balances
    mapping(address => uint256) public balances;
    
    // Events for tracking deposits and withdrawals
    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    
    /**
     * @dev Deposit ETH into the vault
     * @notice Sends ETH to the contract and updates the sender's balance
     */
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        balances[msg.sender] += msg.value;
        
        emit Deposited(msg.sender, msg.value, balances[msg.sender]);
    }
    
    /**
     * @dev Withdraw ETH from the vault
     * @param amount The amount to withdraw in wei
     * @notice Withdraws the specified amount and updates the sender's balance
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Checks-effects-interactions pattern (prevents reentrancy)
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount, balances[msg.sender]);
    }
    
    /**
     * @dev Get the balance of a specific user
     * @param user The address to query
     * @return The user's balance in wei
     */
    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    /**
     * @dev Get the total ETH held by the contract
     * @return The contract's total balance in wei
     */
    function getTotalBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
