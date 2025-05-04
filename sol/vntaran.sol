// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VNTARAN is ERC20, ERC20Burnable, Pausable, Ownable {
    // Declare initial supply variable with a specific data type like this:
    uint256 public constant initialSupply = 1000000000000000000000000; // Assign your desired value here

    constructor() ERC20("VNTARAN Token", "VNTARAN") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(address account)
        internal
        virtual
        whenNotPaused
    {}
}
