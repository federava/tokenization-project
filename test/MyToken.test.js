const Token = artifacts.require("MyToken");
require("dotenv").config({path:"../.env"});

const { assert } = require("chai");
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Token Test", async (accounts) => {
    
    const [deployerAccount, recipient, anotherAccount] = accounts;

    beforeEach(async () => {
        this.myToken = await Token.new(process.env.INITIAL_TOKENS)
    })

    it("all tokens should be in my account", async () => {
        let instance = this.myToken
        //console.log("instanceeeeeeeeeeeeee",instance)
        let totalSupply = await instance.totalSupply();
        let balance = await instance.balanceOf(deployerAccount)
        //console.log("Balanceeeeeeeee: ",balance.toString())
        //console.log("Total supplyyyyyy",totalSupply.toString())

        assert(balance.toString() == totalSupply.toString())
        //return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
    });
/*
    it("is possible to send tokens between accounts", async () => {
        const sendTokens = 1;
        let instance = this.myToken
        let totalSupply = await instance.totalSupply();
        let balance = await instance.balanceOf(deployerAccount)

        assert(balance.toString() == totalSupply.toString())
        //expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);

        let tx = await instance.transfer(recipient, sendTokens)
        console.log("TXXXXXXXXXXXXXXXXXXXXX",tx.receipt.from,tx.receipt.to)
        assert.equal(instance.address, tx.receipt.from)
        assert.equal(instance.recipient, tx.receipt.to)
        //expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled; // promise resolved
        
        let newBalanceOfDeployer = await instance.balanceOf(deployerAccount)
        assert.equal(newBalanceOfDeployer.toString(), totalSupply.sub(new BN(sendTokens)).toString())
        //expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));

        //return expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
    });
*/
/*
    it("is not possible to send more tokens that available in total", async () => {
        let instance = this.myToken
        let balanceOfDeployer = await instance.balanceOf(deployerAccount);
        expect(instance.transfer(recipient, new BN(balanceOfDeployer+1))).to.eventually.be.rejected;
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
    });
*/
});