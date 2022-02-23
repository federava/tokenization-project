pragma solidity ^0.6.0;

import "./Crowdsale.sol";
import "./KycContract.sol";
import "./openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";

contract MyTokenSale is MintedCrowdsale {
    KycContract kyc;
    constructor(
        uint256 rate,    // rate in TKNbits
        address payable wallet,
        IERC20 token,
        KycContract _kyc
    )
        MintedCrowdsale()
        Crowdsale(rate, wallet, token)
        public
    {
        kyc = _kyc;
    }

    
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view override {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(kyc.KycCompleted(msg.sender),"KYC not completed");
    } 
}