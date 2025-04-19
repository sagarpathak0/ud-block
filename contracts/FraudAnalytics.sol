// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title FraudAnalytics
 * @dev Contract for monitoring and analyzing transactions for potential fraud
 */
contract FraudAnalytics is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    
    // Risk levels
    enum RiskLevel { LOW, MEDIUM, HIGH }
    
    // Transaction record structure
    struct TransactionRecord {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string transactionType;
        uint8 riskScore; // 0-100
        bool flagged;
    }
    
    // Alert structure
    struct Alert {
        uint256 id;
        address subject;
        string description;
        RiskLevel severity;
        uint256 timestamp;
        bool active;
    }
    
    // Transaction history
    TransactionRecord[] public transactions;
    // Alerts history
    Alert[] public alerts;
    
    // Address risk scores (0-100)
    mapping(address => uint8) public addressRiskScores;
    // Address transaction counts
    mapping(address => uint256) public addressTransactionCount;
    // High-risk addresses
    EnumerableSet.AddressSet private blacklistedAddresses;
    // Trusted addresses
    EnumerableSet.AddressSet private whitelistedAddresses;
    
    // Trusted analyzers who can submit transactions and generate alerts
    mapping(address => bool) public trustedAnalyzers;
    
    // Risk thresholds
    uint8 public mediumRiskThreshold = 40;
    uint8 public highRiskThreshold = 70;
    
    // Events
    event TransactionRecorded(uint256 indexed id, address indexed from, address indexed to, uint256 amount, uint8 riskScore);
    event AlertGenerated(uint256 indexed id, address indexed subject, RiskLevel severity);
    event AddressRiskUpdated(address indexed subject, uint8 previousScore, uint8 newScore);
    event AddressBlacklisted(address indexed subject);
    event AddressWhitelisted(address indexed subject);
    
    constructor() Ownable(msg.sender) {
        // Add contract deployer as trusted analyzer
        trustedAnalyzers[msg.sender] = true;
    }
    
    /**
     * @dev Record a transaction with fraud risk analysis
     */
    function recordTransaction(
        address from,
        address to,
        uint256 amount,
        string memory transactionType,
        uint8 riskScore
    ) external onlyTrustedAnalyzer {
        require(riskScore <= 100, "Risk score must be between 0-100");
        
        // Store the transaction
        transactions.push(TransactionRecord({
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            transactionType: transactionType,
            riskScore: riskScore,
            flagged: riskScore >= highRiskThreshold
        }));
        
        // Update statistics
        addressTransactionCount[from]++;
        addressTransactionCount[to]++;
        
        // If high risk, generate alert
        if (riskScore >= highRiskThreshold) {
            _generateAlert(
                from, 
                "High-risk transaction detected", 
                RiskLevel.HIGH
            );
        } else if (riskScore >= mediumRiskThreshold) {
            _generateAlert(
                from,
                "Medium-risk transaction detected",
                RiskLevel.MEDIUM
            );
        }
        
        // Update address risk score
        _updateAddressRisk(from, riskScore);
        
        emit TransactionRecorded(
            transactions.length - 1,
            from,
            to,
            amount,
            riskScore
        );
    }
    
    /**
     * @dev Manually generate an alert
     */
    function generateAlert(
        address subject,
        string memory description,
        RiskLevel severity
    ) external onlyTrustedAnalyzer {
        _generateAlert(subject, description, severity);
    }
    
    /**
     * @dev Internal function to generate alerts
     */
    function _generateAlert(
        address subject,
        string memory description,
        RiskLevel severity
    ) internal {
        uint256 alertId = alerts.length;
        
        alerts.push(Alert({
            id: alertId,
            subject: subject,
            description: description,
            severity: severity,
            timestamp: block.timestamp,
            active: true
        }));
        
        emit AlertGenerated(alertId, subject, severity);
    }
    
    /**
     * @dev Update risk score for an address
     */
    function _updateAddressRisk(address subject, uint8 newTransactionRisk) internal {
        // Simple weighted average calculation
        uint8 currentRisk = addressRiskScores[subject];
        uint256 txCount = addressTransactionCount[subject];
        
        // If first transaction, set directly
        if (txCount <= 1) {
            addressRiskScores[subject] = newTransactionRisk;
        } else {
            // Weight previous risk at 70%, new transaction at 30%
            uint8 newRisk = uint8(
                (uint256(currentRisk) * 7 + uint256(newTransactionRisk) * 3) / 10
            );
            addressRiskScores[subject] = newRisk;
        }
        
        // Check for blacklisting
        if (addressRiskScores[subject] >= highRiskThreshold && !isWhitelisted(subject)) {
            _blacklistAddress(subject);
        }
        
        emit AddressRiskUpdated(subject, currentRisk, addressRiskScores[subject]);
    }
    
    /**
     * @dev Manually set risk score for an address
     */
    function setAddressRiskScore(address subject, uint8 riskScore) external onlyTrustedAnalyzer {
        require(riskScore <= 100, "Risk score must be between 0-100");
        
        uint8 previousScore = addressRiskScores[subject];
        addressRiskScores[subject] = riskScore;
        
        // If high risk, blacklist
        if (riskScore >= highRiskThreshold && !isWhitelisted(subject)) {
            _blacklistAddress(subject);
        } else if (riskScore < highRiskThreshold && isBlacklisted(subject)) {
            // Remove from blacklist if risk reduced
            blacklistedAddresses.remove(subject);
        }
        
        emit AddressRiskUpdated(subject, previousScore, riskScore);
    }
    
    /**
     * @dev Blacklist an address
     */
    function blacklistAddress(address subject) external onlyTrustedAnalyzer {
        require(!isWhitelisted(subject), "Cannot blacklist whitelisted address");
        _blacklistAddress(subject);
    }
    
    /**
     * @dev Internal function to blacklist an address
     */
    function _blacklistAddress(address subject) internal {
        if (!blacklistedAddresses.contains(subject)) {
            blacklistedAddresses.add(subject);
            emit AddressBlacklisted(subject);
        }
    }
    
    /**
     * @dev Whitelist an address
     */
    function whitelistAddress(address subject) external onlyOwner {
        if (blacklistedAddresses.contains(subject)) {
            blacklistedAddresses.remove(subject);
        }
        
        whitelistedAddresses.add(subject);
        emit AddressWhitelisted(subject);
    }
    
    /**
     * @dev Remove address from whitelist
     */
    function removeFromWhitelist(address subject) external onlyOwner {
        whitelistedAddresses.remove(subject);
    }
    
    /**
     * @dev Check if address is blacklisted
     */
    function isBlacklisted(address subject) public view returns (bool) {
        return blacklistedAddresses.contains(subject);
    }
    
    /**
     * @dev Check if address is whitelisted
     */
    function isWhitelisted(address subject) public view returns (bool) {
        return whitelistedAddresses.contains(subject);
    }
    
    /**
     * @dev Add a trusted analyzer
     */
    function addTrustedAnalyzer(address analyzer) external onlyOwner {
        trustedAnalyzers[analyzer] = true;
    }
    
    /**
     * @dev Remove a trusted analyzer
     */
    function removeTrustedAnalyzer(address analyzer) external onlyOwner {
        trustedAnalyzers[analyzer] = false;
    }
    
    /**
     * @dev Update risk thresholds
     */
    function updateRiskThresholds(uint8 newMediumThreshold, uint8 newHighThreshold) external onlyOwner {
        require(newMediumThreshold < newHighThreshold, "Medium threshold must be lower than high threshold");
        require(newHighThreshold <= 100, "High threshold cannot exceed 100");
        
        mediumRiskThreshold = newMediumThreshold;
        highRiskThreshold = newHighThreshold;
    }
    
    /**
     * @dev Resolve an alert
     */
    function resolveAlert(uint256 alertId) external onlyTrustedAnalyzer {
        require(alertId < alerts.length, "Alert does not exist");
        alerts[alertId].active = false;
    }
    
    /**
     * @dev Get total number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }
    
    /**
     * @dev Get total number of alerts
     */
    function getAlertCount() external view returns (uint256) {
        return alerts.length;
    }
    
    /**
     * @dev Get number of active alerts
     */
    function getActiveAlertCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < alerts.length; i++) {
            if (alerts[i].active) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Access control modifier for trusted analyzers
     */
    modifier onlyTrustedAnalyzer() {
        require(trustedAnalyzers[msg.sender] || msg.sender == owner(), "Caller is not a trusted analyzer");
        _;
    }
}