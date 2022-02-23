var MyToken = artifacts.require("./MyToken.sol");
var MyTokenSale = artifacts.require("./MyTokenSale.sol");
var MyKycContract = artifacts.require("./KycContract.sol")
require("dotenv").config({path:"../.env"});

// process.env.INITIAL_TOKENS


module.exports = async function(deployer) {
  let addr = await web3.eth.getAccounts()
  //await deployer.deploy(MyToken,process.env.INITIAL_TOKENS); // added inital supply
  await deployer.deploy(MyToken); // without initial supply
  await deployer.deploy(MyKycContract);
  await deployer.deploy(MyTokenSale, 1, addr[0], MyToken.address, MyKycContract.address);
  
  let tokenInstance = await MyToken.deployed()
  let tx1 = tokenInstance.addMinter(MyTokenSale.address);
  let tx2 = tokenInstance.renounceMinter();

  
  //let instance = await MyToken.deployed();

  //let tx = await instance.transfer(MyTokenSale.address, process.env.INITIAL_TOKENS);
};
