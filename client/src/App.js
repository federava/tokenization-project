import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, tokenSaleAddress: null };

  componentDidMount = async () => {
    try {

      if(!window.ethereum){
        alert("install metamask!!!")
      }

      this.metamask = window.ethereum

      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );
      
      //console.log(this.tokenInstance)
      //console.log(MyToken)

      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );

      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      const owner = await this.kycInstance.methods.owner().call()
      //console.log(owner)
      //console.log(this.kycInstance)
      
      const tokenName = await this.tokenInstance.methods.name().call()
      const tokenSymbol = await this.tokenInstance.methods.symbol().call()
      const tokenDecimals = await this.tokenInstance.methods.decimals().call()
      const lastBlockNumber = await this.web3.eth.getBlockNumber()
      //console.log(window.ethereum)
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.listenBlockNumber();
      this.setState({
        loaded: true, 
        kycAddress: "0x123..", 
        tokenSaleAddress: MyTokenSale.networks[this.networkId].address,
        tokenAddress: MyToken.networks[this.networkId].address,
        owner: owner,
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        tokenDecimals: tokenDecimals, 
        blockNumber: lastBlockNumber
      }, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const target = event.target
    const value = target.type === "checkbox" ? target.checked : target.value
    const name = target.name
    this.setState({ [name]: value})
  }

  handleKycWhitelisting = async () => {
    await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]})
    alert("Kyc for " + this.state.kycAddress + " completed")
  }

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call()
    this.setState({userTokens: userTokens})
  }

  listenToTokenTransfer = async () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens)
  }

  handleBuyTokens = async () => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from:this.accounts[0], value: this.web3.utils.toWei("1","wei")})
  }

  // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-subscribe.html
  listenBlockNumber = async () => {
    this.web3.eth.subscribe("newBlockHeaders",(error,result) => {
      if(result){
        this.setState({blockNumber: result.number})
        //console.log(result)
      } else {
        console.log(error)
      }
    })
  }
  
  // https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
  // https://docs.metamask.io/guide/registering-your-token.html#code-free-example
  addTokenToMetamask = async () => {
    //console.log(this.state.tokenAddress)
    console.log(window.ethereum)
    try {
   
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.state.tokenAddress, // The address that the token is at.
            symbol: this.state.tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: this.state.tokenDecimals, // The number of decimals in the token
            image: 'https://bafybeigrwzpsleen5mbz2qlnhjlltbz276252sdovg4oqmlusn42j5j56i.ipfs.infura-ipfs.io/?w=248&fit=crop&auto=format', // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }

    } catch (error) {
      console.log(error);
    }

  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>AmsterDAO Token Sale!</h1>
        <p>Get your tokens today!</p>
        <h2>Kyc whitelisting</h2>
        Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange}/>
        <button type="button" onClick={this.handleKycWhitelisting}>Add to whitelist</button>

        <h2>Buy {this.state.tokenName} {this.state.tokenSymbol} tokens</h2>
        <p>If you want to buy tokens, send wei to this address: {this.state.tokenSaleAddress}</p>
        <button type="button" onClick={this.handleBuyTokens}>Buy 1 token</button>
        <p>You currently have: {this.state.userTokens} AMS Tokens </p>
        <p>Block number: {this.state.blockNumber}</p>

        <button type="button" onClick={this.addTokenToMetamask}>Add {this.state.tokenSymbol} to Metamask </button>
      </div>
    );
  }
}

export default App;
