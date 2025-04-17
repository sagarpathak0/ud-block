// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BudgetManager is Ownable {
    struct Budget {
        uint256 limit;
        uint256 spent;
        uint256 lastReset;
        string category;
    }
    
    mapping(address => mapping(uint256 => Budget)) public userBudgets;
    mapping(address => uint256) public userBudgetCount;
    
    event BudgetCreated(address indexed user, uint256 budgetId, string category, uint256 limit);
    event ExpenseRecorded(address indexed user, uint256 budgetId, uint256 amount);
    event BudgetLimitExceeded(address indexed user, uint256 budgetId, string category);
    
    constructor() Ownable(msg.sender) {}
    
    function createBudget(string memory category, uint256 limit) external {
        uint256 budgetId = userBudgetCount[msg.sender];
        userBudgets[msg.sender][budgetId] = Budget(limit, 0, block.timestamp, category);
        userBudgetCount[msg.sender]++;
        
        emit BudgetCreated(msg.sender, budgetId, category, limit);
    }
    
    function recordExpense(uint256 budgetId, uint256 amount) external {
        Budget storage budget = userBudgets[msg.sender][budgetId];
        budget.spent += amount;
        
        emit ExpenseRecorded(msg.sender, budgetId, amount);
        
        if (budget.spent > budget.limit) {
            emit BudgetLimitExceeded(msg.sender, budgetId, budget.category);
        }
    }
    
    function getBudget(uint256 budgetId) external view returns (uint256, uint256, uint256, string memory) {
        Budget memory budget = userBudgets[msg.sender][budgetId];
        return (budget.limit, budget.spent, budget.lastReset, budget.category);
    }
    
    function resetBudget(uint256 budgetId) external {
        userBudgets[msg.sender][budgetId].spent = 0;
        userBudgets[msg.sender][budgetId].lastReset = block.timestamp;
    }
}