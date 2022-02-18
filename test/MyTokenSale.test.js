const TokenSale = artifacts.require("MyTokenSale");
const Token = artifacts.require("MyToken");
const KycContract = artifacts.require("KycContract");

require("dotenv").config({path:"../.env"});

const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Token Sale Test", async (accounts) => {
    
    const [deployerAccount, recipient, anotherAccount] = accounts;

    it("should not have any tokens in my deployerAccount", async () => {
        let instance = await Token.deployed()
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(0));

    })

    it("all tokens must be in the MyTokenSale SC by default", async () => {
        let instance = await Token.deployed()
        return expect(instance.balanceOf(TokenSale.address)).to.eventually.be.a.bignumber.equal(new BN(process.env.INITIAL_TOKENS))
    })

    it("should be possible to buy tokens", async () => {
        let tokenInstance = await Token.deployed()
        let tokenSaleInstance = await TokenSale.deployed()
        let kycInstance = await KycContract.deployed()
        let balanceBefore = await tokenInstance.balanceOf(deployerAccount)
        await kycInstance.setKycCompleted(deployerAccount, {from: deployerAccount})
        await tokenSaleInstance.sendTransaction({from: deployerAccount, value: web3.utils.toWei("1","wei")})
        //expect(tokenSaleInstance.sendTransaction({from: deployerAccount, value: web3.utils.toWei("1","wei")})).to.be.fulfilled;
        
        //console.log("dspofibsdpimadios´fvmsiodgbnodim",txxx)
        expect(tokenInstance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceBefore.add(new BN(1)))
    })

});