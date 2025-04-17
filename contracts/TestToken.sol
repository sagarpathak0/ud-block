// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
    constructor() ERC20("Test Token", "TEST") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    // Owner can mint additional tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // Public faucet function for testing (with rate limiting)
    mapping(address => uint256) public lastFaucetTime;
    
    function faucet() public {
        require(block.timestamp > lastFaucetTime[msg.sender] + 1 hours, "Please wait before requesting more tokens");
        lastFaucetTime[msg.sender] = block.timestamp;
        
        // Send 100 tokens to the caller
        _mint(msg.sender, 100 * 10 ** decimals());
    }
}