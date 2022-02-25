// contracts/MyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "./openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

contract MyToken is ERC20, ERC20Detailed, ERC20Mintable {
    constructor() ERC20Detailed("Test DAO", "TEST", 0) ERC20Mintable() public {
        
    }
}