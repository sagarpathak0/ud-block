// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title InclusiveBanking
 * @dev Contract for microloans, community savings, and financial education
 */
contract InclusiveBanking is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    
    IERC20 public token;
    
    /*** MICRO-LOANS ***/
    struct Loan {
        uint256 amount;
        uint256 interestRateBasisPoints; // 100 = 1%
        uint256 duration; // in seconds
        uint256 startTime;
        address borrower;
        address lender;
        bool active;
        bool repaid;
    }
    
    mapping(uint256 => Loan) public loans;
    uint256 public loanCount;
    mapping(address => EnumerableSet.UintSet) private userLoans; // loans owned by user
    mapping(address => EnumerableSet.UintSet) private userBorrows; // loans borrowed by user
    
    // Credit score system
    mapping(address => uint256) public creditScores; // 300-850 range
    mapping(address => uint256) public successfulRepayments;
    mapping(address => uint256) public missedRepayments;
    
    // Loan offering constraints
    uint256 public minLoanAmount = 0.1 ether;
    uint256 public maxLoanAmount = 1000 ether;
    uint256 public minInterestRate = 100; // 1%
    uint256 public maxInterestRate = 5000; // 50%
    uint256 public minDuration = 1 days;
    uint256 public maxDuration = 365 days;
    
    /*** COMMUNITY SAVINGS ***/
    struct SavingsGroup {
        string name;
        uint256 goalAmount;
        uint256 currentAmount;
        uint256 createdAt;
        address creator;
        bool active;
    }
    
    mapping(uint256 => SavingsGroup) public savingsGroups;
    uint256 public savingsGroupCount;
    
    // Track members of savings groups
    mapping(uint256 => EnumerableSet.AddressSet) private groupMembers;
    // Track user contributions to groups
    mapping(uint256 => mapping(address => uint256)) public userContributions;
    // Track which groups a user is part of
    mapping(address => EnumerableSet.UintSet) private userGroups;
    
    /*** FINANCIAL EDUCATION ***/
    struct EducationModule {
        string title;
        string contentHash; // IPFS hash of content
        uint256 rewardAmount;
        bool active;
    }
    
    mapping(uint256 => EducationModule) public educationModules;
    uint256 public moduleCount;
    
    // Track modules completed by users
    mapping(address => EnumerableSet.UintSet) private completedModules;
    
    /*** EVENTS ***/
    // Loan events
    event LoanOffered(uint256 indexed loanId, address indexed lender, uint256 amount, uint256 interestRate, uint256 duration);
    event LoanTaken(uint256 indexed loanId, address indexed borrower);
    event LoanRepaid(uint256 indexed loanId);
    event LoanCancelled(uint256 indexed loanId);
    event CreditScoreUpdated(address indexed user, uint256 newScore);
    
    // Savings events
    event SavingsGroupCreated(uint256 indexed groupId, string name, address indexed creator, uint256 goalAmount);
    event ContributionAdded(uint256 indexed groupId, address indexed contributor, uint256 amount);
    event GroupGoalReached(uint256 indexed groupId);
    event MemberJoined(uint256 indexed groupId, address indexed member);
    
    // Education events
    event ModuleAdded(uint256 indexed moduleId, string title);
    event ModuleCompleted(address indexed user, uint256 indexed moduleId, uint256 rewardAmount);
    
    /**
     * @dev Constructor
     */
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
        
        // Initialize with a base credit score for all users
        creditScores[address(0)] = 650; // Default score for new users
    }
    
    /*** MICRO-LOANS FUNCTIONS ***/
    /**
     * @dev Offer a loan
     */
    function offerLoan(uint256 amount, uint256 interestRateBasisPoints, uint256 duration) external {
        // Validate parameters
        require(amount >= minLoanAmount && amount <= maxLoanAmount, "Invalid loan amount");
        require(interestRateBasisPoints >= minInterestRate && interestRateBasisPoints <= maxInterestRate, "Invalid interest rate");
        require(duration >= minDuration && duration <= maxDuration, "Invalid duration");
        
        // Check allowance and balance
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient token allowance");
        
        // Transfer tokens from lender to contract
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // Create loan
        loans[loanCount] = Loan({
            amount: amount,
            interestRateBasisPoints: interestRateBasisPoints,
            duration: duration,
            startTime: 0, // Set when loan is taken
            borrower: address(0), // Set when loan is taken
            lender: msg.sender,
            active: true,
            repaid: false
        });
        
        // Add to user's loans
        userLoans[msg.sender].add(loanCount);
        
        emit LoanOffered(loanCount, msg.sender, amount, interestRateBasisPoints, duration);
        loanCount++;
    }
    
    /**
     * @dev Take a loan
     */
    function takeLoan(uint256 loanId) external {
        require(loanId < loanCount, "Loan does not exist");
        Loan storage loan = loans[loanId];
        
        require(loan.active, "Loan is not active");
        require(loan.borrower == address(0), "Loan already taken");
        require(msg.sender != loan.lender, "Lender cannot be borrower");
        
        // Get user's credit score (or default)
        uint256 userScore = creditScores[msg.sender];
        if (userScore == 0) {
            userScore = creditScores[address(0)]; // Default score
        }
        
        // Higher amount loans may require better credit
        if (loan.amount > 10 ether) {
            require(userScore >= 600, "Credit score too low for this loan amount");
        }
        
        // Update loan details
        loan.borrower = msg.sender;
        loan.startTime = block.timestamp;
        
        // Add to borrower's loans
        userBorrows[msg.sender].add(loanId);
        
        // Transfer tokens to borrower
        require(token.transfer(msg.sender, loan.amount), "Token transfer failed");
        
        emit LoanTaken(loanId, msg.sender);
    }
    
    /**
     * @dev Repay a loan
     */
    function repayLoan(uint256 loanId) external {
        require(loanId < loanCount, "Loan does not exist");
        Loan storage loan = loans[loanId];
        
        require(loan.active, "Loan is not active");
        require(loan.borrower == msg.sender, "Only borrower can repay loan");
        require(!loan.repaid, "Loan already repaid");
        
        // Calculate repayment amount with interest
        uint256 interest = (loan.amount * loan.interestRateBasisPoints) / 10000;
        uint256 totalRepayment = loan.amount + interest;
        
        // Check allowance and balance
        require(token.balanceOf(msg.sender) >= totalRepayment, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= totalRepayment, "Insufficient token allowance");
        
        // Transfer tokens from borrower to contract
        require(token.transferFrom(msg.sender, address(this), totalRepayment), "Token transfer failed");
        
        // Transfer tokens to lender
        require(token.transfer(loan.lender, totalRepayment), "Token transfer to lender failed");
        
        // Update loan status
        loan.repaid = true;
        loan.active = false;
        
        // Update credit score
        successfulRepayments[msg.sender]++;
        _updateCreditScore(msg.sender);
        
        emit LoanRepaid(loanId);
    }
    
    /**
     * @dev Cancel a loan (only available for lender of an active, not-yet-taken loan)
     */
    function cancelLoan(uint256 loanId) external {
        require(loanId < loanCount, "Loan does not exist");
        Loan storage loan = loans[loanId];
        
        require(loan.active, "Loan is not active");
        require(loan.lender == msg.sender, "Only lender can cancel loan");
        require(loan.borrower == address(0), "Loan already taken");
        
        // Transfer tokens back to lender
        require(token.transfer(loan.lender, loan.amount), "Token transfer failed");
        
        // Update loan status
        loan.active = false;
        
        emit LoanCancelled(loanId);
    }
    
    /**
     * @dev Get user's loans
     */
    function getUserLoans(address user) external view returns(uint256[] memory) {
        uint256 count = userLoans[user].length();
        uint256[] memory result = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = userLoans[user].at(i);
        }
        
        return result;
    }
    
    /**
     * @dev Get user's borrowings
     */
    function getUserBorrows(address user) external view returns(uint256[] memory) {
        uint256 count = userBorrows[user].length();
        uint256[] memory result = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = userBorrows[user].at(i);
        }
        
        return result;
    }
    
    /**
     * @dev Update credit score based on repayment history
     */
    function _updateCreditScore(address user) internal {
        uint256 total = successfulRepayments[user] + missedRepayments[user];
        if (total == 0) return;
        
        // Base score
        uint256 score = creditScores[address(0)];
        
        // Improve score based on successful repayments
        if (successfulRepayments[user] > 0) {
            uint256 repaymentRatio = (successfulRepayments[user] * 100) / total;
            
            // Exponential improvement, capped at 850
            if (repaymentRatio >= 98) {
                score = 800;
                score += (successfulRepayments[user] > 10) ? 50 : successfulRepayments[user] * 5;
            } else if (repaymentRatio >= 90) {
                score = 750;
                score += (successfulRepayments[user] > 5) ? 25 : successfulRepayments[user] * 5;
            } else if (repaymentRatio >= 80) {
                score = 700;
            } else if (repaymentRatio >= 70) {
                score = 650;
            } else {
                score = 600;
            }
            
            // Cap at 850
            if (score > 850) score = 850;
        }
        
        // Reduce score based on missed repayments
        if (missedRepayments[user] > 0) {
            uint256 reduction = 0;
            if (missedRepayments[user] >= 5) {
                reduction = 200;
            } else {
                reduction = missedRepayments[user] * 40;
            }
            
            // Don't go below 300
            if (score <= 300 + reduction) {
                score = 300;
            } else {
                score -= reduction;
            }
        }
        
        creditScores[user] = score;
        emit CreditScoreUpdated(user, score);
    }
    
    /**
     * @dev Mark a loan as defaulted (missed repayment)
     */
    function markLoanDefaulted(uint256 loanId) external {
        require(loanId < loanCount, "Loan does not exist");
        Loan storage loan = loans[loanId];
        
        // Only lender or owner can mark as defaulted
        require(msg.sender == loan.lender || msg.sender == owner(), "Not authorized");
        
        // Loan must be active and taken, not repaid
        require(loan.active, "Loan is not active");
        require(loan.borrower != address(0), "Loan not taken");
        require(!loan.repaid, "Loan already repaid");
        
        // Can only be marked as defaulted after duration has passed
        require(block.timestamp > loan.startTime + loan.duration, "Loan not yet due");
        
        // Update loan status
        loan.active = false;
        
        // Update credit score
        missedRepayments[loan.borrower]++;
        _updateCreditScore(loan.borrower);
    }
    
    /*** COMMUNITY SAVINGS FUNCTIONS ***/
    /**
     * @dev Create a new savings group
     */
    function createSavingsGroup(string memory name, uint256 goalAmount, uint256 initialContribution) external {
        require(goalAmount > 0, "Goal amount must be greater than 0");
        require(initialContribution > 0, "Initial contribution must be greater than 0");
        
        // Check allowance and balance
        require(token.balanceOf(msg.sender) >= initialContribution, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= initialContribution, "Insufficient token allowance");
        
        // Transfer initial contribution
        require(token.transferFrom(msg.sender, address(this), initialContribution), "Token transfer failed");
        
        // Create group
        savingsGroups[savingsGroupCount] = SavingsGroup({
            name: name,
            goalAmount: goalAmount,
            currentAmount: initialContribution,
            createdAt: block.timestamp,
            creator: msg.sender,
            active: true
        });
        
        // Add creator to members and track contribution
        groupMembers[savingsGroupCount].add(msg.sender);
        userContributions[savingsGroupCount][msg.sender] = initialContribution;
        userGroups[msg.sender].add(savingsGroupCount);
        
        emit SavingsGroupCreated(savingsGroupCount, name, msg.sender, goalAmount);
        emit ContributionAdded(savingsGroupCount, msg.sender, initialContribution);
        
        // Check if goal reached
        if (initialContribution >= goalAmount) {
            emit GroupGoalReached(savingsGroupCount);
        }
        
        savingsGroupCount++;
    }
    
    /**
     * @dev Join a savings group
     */
    function joinSavingsGroup(uint256 groupId, uint256 contribution) external {
        require(groupId < savingsGroupCount, "Group does not exist");
        SavingsGroup storage group = savingsGroups[groupId];
        
        require(group.active, "Group is not active");
        require(!groupMembers[groupId].contains(msg.sender), "Already a member");
        require(contribution > 0, "Contribution must be greater than 0");
        
        // Check allowance and balance
        require(token.balanceOf(msg.sender) >= contribution, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= contribution, "Insufficient token allowance");
        
        // Transfer contribution
        require(token.transferFrom(msg.sender, address(this), contribution), "Token transfer failed");
        
        // Add member and track contribution
        groupMembers[groupId].add(msg.sender);
        userContributions[groupId][msg.sender] = contribution;
        userGroups[msg.sender].add(groupId);
        
        // Update group total
        group.currentAmount += contribution;
        
        emit MemberJoined(groupId, msg.sender);
        emit ContributionAdded(groupId, msg.sender, contribution);
        
        // Check if goal reached
        if (group.currentAmount >= group.goalAmount) {
            emit GroupGoalReached(groupId);
        }
    }
    
    /**
     * @dev Contribute to a savings group
     */
    function contributeToGroup(uint256 groupId, uint256 amount) external {
        require(groupId < savingsGroupCount, "Group does not exist");
        SavingsGroup storage group = savingsGroups[groupId];
        
        require(group.active, "Group is not active");
        require(groupMembers[groupId].contains(msg.sender), "Not a member");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check allowance and balance
        require(token.balanceOf(msg.sender) >= amount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient token allowance");
        
        // Transfer contribution
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        
        // Update contribution
        userContributions[groupId][msg.sender] += amount;
        
        // Update group total
        group.currentAmount += amount;
        
        emit ContributionAdded(groupId, msg.sender, amount);
        
        // Check if goal reached
        if (group.currentAmount >= group.goalAmount) {
            emit GroupGoalReached(groupId);
        }
    }
    
    /**
     * @dev Get group members
     */
    function getGroupMembers(uint256 groupId) external view returns(address[] memory) {
        require(groupId < savingsGroupCount, "Group does not exist");
        
        uint256 count = groupMembers[groupId].length();
        address[] memory result = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = groupMembers[groupId].at(i);
        }
        
        return result;
    }
    
    /**
     * @dev Get user's groups
     */
    function getUserGroups(address user) external view returns(uint256[] memory) {
        uint256 count = userGroups[user].length();
        uint256[] memory result = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = userGroups[user].at(i);
        }
        
        return result;
    }
    
    /*** FINANCIAL EDUCATION FUNCTIONS ***/
    /**
     * @dev Add education module
     */
    function addEducationModule(string memory title, string memory contentHash, uint256 rewardAmount) external onlyOwner {
        educationModules[moduleCount] = EducationModule({
            title: title,
            contentHash: contentHash,
            rewardAmount: rewardAmount,
            active: true
        });
        
        emit ModuleAdded(moduleCount, title);
        moduleCount++;
    }
    
    /**
     * @dev Complete education module
     */
    function completeModule(uint256 moduleId) external {
        require(moduleId < moduleCount, "Module does not exist");
        EducationModule storage module = educationModules[moduleId];
        
        require(module.active, "Module is not active");
        require(!completedModules[msg.sender].contains(moduleId), "Module already completed");
        
        // Mark as completed
        completedModules[msg.sender].add(moduleId);
        
        // Transfer reward
        if (module.rewardAmount > 0) {
            require(token.transfer(msg.sender, module.rewardAmount), "Token transfer failed");
        }
        
        emit ModuleCompleted(msg.sender, moduleId, module.rewardAmount);
    }
    
    /**
     * @dev Get completed modules
     */
    function getCompletedModules(address user) external view returns(uint256[] memory) {
        uint256 count = completedModules[user].length();
        uint256[] memory result = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = completedModules[user].at(i);
        }
        
        return result;
    }
    
    /*** ADMIN FUNCTIONS ***/
    /**
     * @dev Update loan constraints
     */
    function updateLoanConstraints(
        uint256 _minLoanAmount,
        uint256 _maxLoanAmount,
        uint256 _minInterestRate,
        uint256 _maxInterestRate,
        uint256 _minDuration,
        uint256 _maxDuration
    ) external onlyOwner {
        require(_minLoanAmount < _maxLoanAmount, "Min amount must be less than max");
        require(_minInterestRate < _maxInterestRate, "Min interest must be less than max");
        require(_minDuration < _maxDuration, "Min duration must be less than max");
        
        minLoanAmount = _minLoanAmount;
        maxLoanAmount = _maxLoanAmount;
        minInterestRate = _minInterestRate;
        maxInterestRate = _maxInterestRate;
        minDuration = _minDuration;
        maxDuration = _maxDuration;
    }
    
    /**
     * @dev Set default credit score
     */
    function setDefaultCreditScore(uint256 score) external onlyOwner {
        require(score >= 300 && score <= 850, "Score must be between 300-850");
        creditScores[address(0)] = score;
    }
    
    /**
     * @dev Update token address
     */
    function updateToken(address _token) external onlyOwner {
        token = IERC20(_token);
    }
}