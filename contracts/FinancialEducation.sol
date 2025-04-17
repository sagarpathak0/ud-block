// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FinancialEducation is Ownable {
    // Educational module structure
    struct Module {
        string title;
        string contentURI; // IPFS hash or other URI
        uint256 difficulty; // 1-5 scale
        bool active;
    }
    
    // User progress tracking
    struct UserProgress {
        uint256 modulesCompleted;
        uint256 lastCompletionTime;
        mapping(uint256 => bool) completedModules;
    }
    
    Module[] public modules;
    mapping(address => UserProgress) public userProgress;
    
    // Certified educators who can add content
    mapping(address => bool) public educators;
    
    event ModuleAdded(uint256 moduleId, string title);
    event ModuleCompleted(address user, uint256 moduleId);
    event EducatorAdded(address educator);
    event EducatorRemoved(address educator);
    
    constructor() Ownable(msg.sender) {
        educators[msg.sender] = true;
    }
    
    // Manage educators
    function addEducator(address educator) external onlyOwner {
        educators[educator] = true;
        emit EducatorAdded(educator);
    }
    
    function removeEducator(address educator) external onlyOwner {
        educators[educator] = false;
        emit EducatorRemoved(educator);
    }
    
    // Add an educational module
    function addModule(string memory title, string memory contentURI, uint256 difficulty) external {
        require(educators[msg.sender], "Only approved educators can add modules");
        require(difficulty >= 1 && difficulty <= 5, "Difficulty must be between 1-5");
        
        modules.push(Module({
            title: title,
            contentURI: contentURI,
            difficulty: difficulty,
            active: true
        }));
        
        emit ModuleAdded(modules.length - 1, title);
    }
    
    // Mark a module as completed by user
    function completeModule(uint256 moduleId) external {
        require(moduleId < modules.length, "Module does not exist");
        require(modules[moduleId].active, "Module is not active");
        require(!userProgress[msg.sender].completedModules[moduleId], "Module already completed");
        
        UserProgress storage progress = userProgress[msg.sender];
        progress.completedModules[moduleId] = true;
        progress.modulesCompleted++;
        progress.lastCompletionTime = block.timestamp;
        
        emit ModuleCompleted(msg.sender, moduleId);
    }
    
    // Get total modules count
    function getModuleCount() external view returns (uint256) {
        return modules.length;
    }
    
    // Get user's financial education level (basic scoring)
    function getUserEducationLevel(address user) external view returns (uint256) {
        uint256 completed = userProgress[user].modulesCompleted;
        if (completed == 0) return 0;
        if (completed < 3) return 1; // Beginner
        if (completed < 7) return 2; // Intermediate
        if (completed < 12) return 3; // Advanced
        return 4; // Expert
    }
}