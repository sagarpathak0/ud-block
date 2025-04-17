// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CommunitySavings is Ownable {
    IERC20 public immutable token;
    
    struct SavingsPool {
        string name;
        uint256 goalAmount;
        uint256 totalSaved;
        uint256 memberCount;
        uint256 startDate;
        uint256 endDate;
        bool active;
        address creator;
    }
    
    // Pool data
    mapping(uint256 => SavingsPool) public pools;
    mapping(uint256 => mapping(address => uint256)) public memberContributions;
    mapping(uint256 => address[]) public poolMembers;
    uint256 public poolCount;
    
    event PoolCreated(uint256 poolId, string name, address creator);
    event ContributionMade(uint256 poolId, address contributor, uint256 amount);
    event PoolCompleted(uint256 poolId);
    event FundsWithdrawn(uint256 poolId, address member, uint256 amount);
    
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }
    
    // Create a new savings pool
    function createPool(string memory name, uint256 goalAmount, uint256 durationDays) external {
        require(goalAmount > 0, "Goal amount must be greater than 0");
        
        pools[poolCount] = SavingsPool({
            name: name,
            goalAmount: goalAmount,
            totalSaved: 0,
            memberCount: 0,
            startDate: block.timestamp,
            endDate: block.timestamp + (durationDays * 1 days),
            active: true,
            creator: msg.sender
        });
        
        // Add creator as first member
        poolMembers[poolCount].push(msg.sender);
        pools[poolCount].memberCount++;
        
        emit PoolCreated(poolCount, name, msg.sender);
        poolCount++;
    }
    
    // Join an existing pool
    function joinPool(uint256 poolId) external {
        SavingsPool storage pool = pools[poolId];
        require(pool.active, "Pool is not active");
        
        // Check if user is already a member
        bool isMember = false;
        for (uint i = 0; i < poolMembers[poolId].length; i++) {
            if (poolMembers[poolId][i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        
        if (!isMember) {
            poolMembers[poolId].push(msg.sender);
            pool.memberCount++;
        }
    }
    
    // Make a contribution to a pool
    function contribute(uint256 poolId, uint256 amount) external {
        SavingsPool storage pool = pools[poolId];
        require(pool.active, "Pool is not active");
        require(amount > 0, "Contribution amount must be greater than 0");
        
        // Check if user is a pool member
        bool isMember = false;
        for (uint i = 0; i < poolMembers[poolId].length; i++) {
            if (poolMembers[poolId][i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "You are not a member of this pool");
        
        // Transfer tokens to contract
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // Update contribution records
        memberContributions[poolId][msg.sender] += amount;
        pool.totalSaved += amount;
        
        emit ContributionMade(poolId, msg.sender, amount);
        
        // Check if goal reached
        if (pool.totalSaved >= pool.goalAmount) {
            pool.active = false;
            emit PoolCompleted(poolId);
        }
    }
    
    // Withdraw your share after pool completion or expiry
    function withdraw(uint256 poolId) external {
        SavingsPool storage pool = pools[poolId];
        require(!pool.active || block.timestamp > pool.endDate, "Pool is still active and not expired");
        
        uint256 contribution = memberContributions[poolId][msg.sender];
        require(contribution > 0, "No contribution to withdraw");
        
        // Reset contribution to prevent double withdrawal
        memberContributions[poolId][msg.sender] = 0;
        
        // Calculate proportional distribution if pool ended early
        uint256 withdrawAmount;
        if (pool.totalSaved < pool.goalAmount && block.timestamp > pool.endDate) {
            withdrawAmount = contribution;
        } else {
            withdrawAmount = contribution;
        }
        
        require(token.transfer(msg.sender, withdrawAmount), "Token transfer failed");
        
        emit FundsWithdrawn(poolId, msg.sender, withdrawAmount);
    }
}