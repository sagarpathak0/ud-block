// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MicroInvestor is Ownable {
    IERC20 public immutable token;
    address public yieldProtocol; // Address of the protocol where funds are invested
    
    mapping(address => uint256) public userDeposits;
    uint256 public totalPooled;
    uint256 public minimumInvestmentAmount;
    
    event Deposited(address indexed user, uint256 amount);
    event InvestmentMade(uint256 amount);
    event YieldDistributed(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor(address _token, address _yieldProtocol, uint256 _minimumInvestmentAmount) Ownable(msg.sender) {
        token = IERC20(_token);
        yieldProtocol = _yieldProtocol;
        minimumInvestmentAmount = _minimumInvestmentAmount;
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Cannot deposit zero amount");
        token.transferFrom(msg.sender, address(this), amount);
        userDeposits[msg.sender] += amount;
        totalPooled += amount;
        
        emit Deposited(msg.sender, amount);
        
        // If the total pooled amount exceeds minimum, invest it
        if (totalPooled >= minimumInvestmentAmount) {
            _investPooledFunds();
        }
    }
    
    function withdraw(uint256 amount) external {
        require(amount > 0, "Cannot withdraw zero amount");
        require(userDeposits[msg.sender] >= amount, "Insufficient balance");
        
        userDeposits[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function _investPooledFunds() internal {
        // This is a placeholder for connecting to yield protocols
        // In a real implementation, you would interface with protocols like Aave or Compound
        
        emit InvestmentMade(totalPooled);
        totalPooled = 0; // Reset after investment
    }
    
    function getUserBalance() external view returns (uint256) {
        return userDeposits[msg.sender];
    }
    
    function updateYieldProtocol(address _newYieldProtocol) external onlyOwner {
        yieldProtocol = _newYieldProtocol;
    }
}