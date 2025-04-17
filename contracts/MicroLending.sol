// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MicroLending is Ownable {
    IERC20 public immutable token;
    
    struct Loan {
        uint256 amount;
        uint256 interestRate; // In basis points (1/100th of a percent)
        uint256 duration; // In seconds
        uint256 startTime;
        address borrower;
        address lender;
        bool active;
        bool repaid;
    }
    
    mapping(uint256 => Loan) public loans;
    uint256 public loanCount;
    
    // Reputation system
    mapping(address => uint256) public successfulRepayments;
    mapping(address => uint256) public defaultedLoans;
    
    event LoanOffered(uint256 loanId, address lender, uint256 amount, uint256 interestRate, uint256 duration);
    event LoanTaken(uint256 loanId, address borrower);
    event LoanRepaid(uint256 loanId);
    event LoanDefaulted(uint256 loanId);
    
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }
    
    // Create a loan offer
    function offerLoan(uint256 amount, uint256 interestRate, uint256 duration) external {
        require(amount > 0, "Loan amount must be greater than 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        loans[loanCount] = Loan({
            amount: amount,
            interestRate: interestRate,
            duration: duration,
            startTime: 0,
            borrower: address(0),
            lender: msg.sender,
            active: true,
            repaid: false
        });
        
        emit LoanOffered(loanCount, msg.sender, amount, interestRate, duration);
        loanCount++;
    }
    
    // Take an available loan
    function takeLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan is not active");
        require(loan.borrower == address(0), "Loan already taken");
        
        loan.borrower = msg.sender;
        loan.startTime = block.timestamp;
        
        require(token.transfer(msg.sender, loan.amount), "Token transfer failed");
        
        emit LoanTaken(loanId, msg.sender);
    }
    
    // Calculate repayment amount including interest
    function calculateRepaymentAmount(uint256 loanId) public view returns (uint256) {
        Loan storage loan = loans[loanId];
        uint256 interest = (loan.amount * loan.interestRate) / 10000;
        return loan.amount + interest;
    }
    
    // Repay a loan
    function repayLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan is not active");
        require(loan.borrower == msg.sender, "Only borrower can repay");
        require(!loan.repaid, "Loan already repaid");
        
        uint256 repaymentAmount = calculateRepaymentAmount(loanId);
        require(token.transferFrom(msg.sender, loan.lender, repaymentAmount), "Repayment failed");
        
        loan.repaid = true;
        loan.active = false;
        
        successfulRepayments[msg.sender]++;
        
        emit LoanRepaid(loanId);
    }
    
    // Mark a loan as defaulted (can only be called after loan duration has passed)
    function markAsDefaulted(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan is not active");
        require(!loan.repaid, "Loan already repaid");
        require(block.timestamp > loan.startTime + loan.duration, "Loan duration not expired");
        require(msg.sender == loan.lender, "Only lender can mark as defaulted");
        
        loan.active = false;
        defaultedLoans[loan.borrower]++;
        
        emit LoanDefaulted(loanId);
    }
    
    // Get credit score (simple implementation)
    function getCreditScore(address user) external view returns (uint256) {
        uint256 total = successfulRepayments[user] + defaultedLoans[user];
        if (total == 0) return 0;
        return (successfulRepayments[user] * 100) / total;
    }
}