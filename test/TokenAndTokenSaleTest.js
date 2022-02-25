const TokenSale = artifacts.require("MyTokenSale");
const Token = artifacts.require("MyToken");
const KycContract = artifacts.require("KycContract");

contract("TokenSale Test", async (accounts) => {
    
    const [deployerAccount, anotherAccount] = accounts;

    it("should not have supply when deployed", async () => {
        let instance = await Token.deployed()
        let balance = await instance.totalSupply();
        assert.equal(balance.toString(), "0")
    })

    it("should have the token sale as a minter", async () => {
        let tokenSaleInstance = await TokenSale.deployed()
        let tokenInstance = await Token.deployed()
        let isMinter = await tokenInstance.isMinter(tokenSaleInstance.address)
        assert.equal(isMinter, true)
        let isNotMinter = await tokenInstance.isMinter(deployerAccount)
        assert.equal(isNotMinter, false)
    })

    it("should have the deployer address as the owner", async () => {
        let instance = await KycContract.deployed()
        let owner = await instance.owner();
        assert.equal(owner, deployerAccount)
    })

    it("should fail autoapproving anotherAccount and succede approving it with deployedAccount", async () => {
        let instance = await KycContract.deployed()

        try {
            await instance.setKycCompleted(anotherAccount,{from:anotherAccount})
            assert.equal(1,2) // if it doesnt throws an error, it should not pass
        } catch (error) {
            assert(error.message.indexOf("caller is not the owner") >= 0)
        }

        await instance.setKycCompleted(anotherAccount)
        let anotherAccountCompleted = await instance.KycCompleted(anotherAccount)
        assert.equal(anotherAccountCompleted,true)
    })

    it("should anotherAccount mint 10 tokens and send them to deployerAccount, and supply equals 10", async () => {
        let kycContractInstance = await KycContract.deployed()
        let tokenSaleInstance = await TokenSale.deployed()
        let tokenInstance = await Token.deployed()
        await kycContractInstance.setKycCompleted(anotherAccount)
        await tokenSaleInstance.sendTransaction({from: anotherAccount, value: web3.utils.toWei("10","wei")})
        let anotherAccountBalance1 = await tokenInstance.balanceOf(anotherAccount)
        assert.equal(anotherAccountBalance1.toString(),"10")

        await tokenInstance.transfer(deployerAccount,10,{from:anotherAccount})
        let anotherAccountBalance2 = await tokenInstance.balanceOf(anotherAccount)
        let deployerAccountBalance = await tokenInstance.balanceOf(deployerAccount)
        assert.equal(anotherAccountBalance2.toString(),"0")
        assert.equal(deployerAccountBalance.toString(),"10")
      
        let tokenSupply = await tokenInstance.totalSupply()
        assert.equal(tokenSupply.toString(),"10")
    })

});