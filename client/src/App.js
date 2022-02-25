import React, { Component } from "react";

// Web3 and Smart Contracts imports
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import logo from './testtoken.png';
import "./App.css";
import "./Header.css"; 

class App extends Component {
  
  state = { loaded: false, tokenSaleAddress: null };

  componentDidMount = async () => {
    try {

      if(!window.ethereum){
        alert("Go to metamask.io and install metamask to use this DApp.")
      }

      // https://docs.metamask.io/guide/ethereum-provider.html#events
      window.ethereum.on('chainChanged', (_chainId) => window.location.reload());

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
      
      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );

      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      const owner = await this.kycInstance.methods.owner().call()

      const tokenName = await this.tokenInstance.methods.name().call()
      const tokenSymbol = await this.tokenInstance.methods.symbol().call()
      const tokenDecimals = await this.tokenInstance.methods.decimals().call()
      const lastBlockNumber = await this.web3.eth.getBlockNumber()
      const totalSupply = await this.tokenInstance.methods.totalSupply().call()
      const rate = await this.tokenSaleInstance.methods.rate().call()
      const chainId = await this.web3.eth.getChainId()
      const accounts = await this.web3.eth.getAccounts()
      const balance = await this.web3.eth.getBalance(accounts[0])
      const whitelisted = await this.kycInstance.methods.KycCompleted(accounts[0]).call()
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.listenBlockNumber();
      window.ethereum.on('accountsChanged', () => this.handleAccountChange());
      this.setState({
        kycAddress: "0x123..", 
        tokenSaleAddress: MyTokenSale.networks[this.networkId].address,
        tokenAddress: MyToken.networks[this.networkId].address,
        owner: owner,
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        tokenDecimals: tokenDecimals, 
        blockNumber: lastBlockNumber,
        totalSupply: totalSupply,
        rate: rate,
        chainId: chainId,
        accounts: accounts,
        balance: balance,
        whitelisted: whitelisted,
        loaded: true,
      }, this.updateUserTokens);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details. Try connecting to the correct network.`,
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
    if(this.web3.utils.isAddress(this.state.kycAddress)) {
      await this.kycInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]})
      alert("Kyc for " + this.state.kycAddress + " completed")
    } else {
      alert("Please input a valid address, " + this.state.kycAddress + " is not an address.")
    }    
  }

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call()
    this.setState({userTokens: userTokens})
  }

  handleAccountChange = async () => {
    this.updateUserTokens()
    const accounts = await this.web3.eth.getAccounts()
    const balance = await this.web3.eth.getBalance(accounts[0])
    const whitelisted = await this.kycInstance.methods.KycCompleted(accounts[0]).call()
    this.setState({accounts: accounts, balance: balance, whitelisted: whitelisted})
  }

  listenToTokenTransfer = async () => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens)
  }

  handleBuyTokens = async () => {
    let amount = document.getElementById("weiAmount").value
    if(amount < 0) return alert("Value must be positive.")
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from:this.accounts[0], value: this.web3.utils.toWei(amount.toString(),"wei")})
    let totalSupply = await this.tokenInstance.methods.totalSupply().call()
    this.setState({totalSupply: totalSupply})
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

  handleClickAccount = () => {
    navigator.clipboard.writeText(this.state.accounts[0])
    alert(this.state.accounts[0] + " copied to clipboard!")
  }

  handlePrivateKey = () => {
    const container = document.getElementById("privateKeyContainer")
    // Hardcoded private and public keys for free usage in the Rinkeby network
    let priK = "9bf64bc7afe3388dcdcbf414369fd612722f5cd313832166edb5bca8dc4c82f0"
    let pubK = "0x986a64A38778011d371e5fBEc7A01683385ae84E"
    let html = "This private keys are for testing porposes, do not use them outside testing blockchains!<br>"
    html += "Click the private or public key to copy to clipboard.<br><br>"
    html += `<a onclick="navigator.clipboard.writeText('${priK}');alert('Private key copied to clipboard');">Private Keys: ${priK}</a><br>`
    html += `<a onclick="navigator.clipboard.writeText('${pubK}');alert('Public key copied to clipboard');">Address: ${pubK}</a> `
    container.innerHTML = html
  }
  
  // https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
  // https://docs.metamask.io/guide/registering-your-token.html#code-free-example
  addTokenToMetamask = async () => {
    //console.log(this.state.tokenAddress)
    //console.table(window.ethereum)
    try {
   
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: this.state.tokenAddress, // The address that the token is at.
            symbol: this.state.tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: this.state.tokenDecimals, // The number of decimals in the token
            image: 'https://bafybeifkkdtuyjs34bnujrqassvo6q3okwncahwfzbpqglhctypaamnuse.ipfs.infura-ipfs.io/?w=248&fit=crop&auto=format', // A string url of the token logo
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
      return <div className="App">
        <br></br>Loading Web3, accounts, and contract...<br></br>
        <img src={logo} className="App-logo" alt="logo" />
        <br></br>Connect to Rinkeby, smart contracts are deployed there.<br></br>
      </div>;
    }
    return (
      <div className="App">
        <div className="header">
        <a className="logo">{this.state.tokenName}</a>
          <div className="header-right">
            <a >ChainID: {this.state.chainId}</a>
            <a onClick={this.addTokenToMetamask}>{this.state.userTokens} {this.state.tokenSymbol} <img src={logo} className="smallLogoHeader"/></a>
            <a >{Math.round(this.state.balance*1e-16)/100} ETH</a>
            <a onClick={this.handleClickAccount}>{this.state.accounts[0].substr(0,6)+"..."+this.state.accounts[0].substr(-4)}</a>
          </div>
        </div>

        <h1>{this.state.tokenName} token sale!</h1>
        <p>Get your tokens today at rate of {this.state.rate} token per wei!</p>
        <h1>Total Supply: {this.state.totalSupply} <img src={logo} className="smallLogo"/></h1>
        <br></br>
        <h2>KYC whitelisting</h2>
        <p>Only the owner can add accounts to the whitelist: </p>
        <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange}/>
        <button type="button" onClick={this.handleKycWhitelisting}>Add to whitelist</button>
        <p>Are you the KYC smart contract owner? {this.state.owner ? "YES" : "NO"}</p>
        <p>Is you account whitelisted? {this.state.whitelisted ? "YES" : "NO"}</p>
        <br></br>

        <h2>Buy {this.state.tokenName} {this.state.tokenSymbol} tokens</h2>
        <p>If you are whitelisted you can buy tokens by sending wei to the crowdsale smart contract:</p>
        
        <p>{this.state.tokenSaleAddress}</p>
        <p>Amounts of tokens to buy: <input id="weiAmount" type="number" min="0" placeholder="10"/>
        <button type="button" onClick={this.handleBuyTokens}>Buy tokens</button></p>
        <br></br>

        <h2 id="privateKeyContainer" onClick={this.handlePrivateKey}>In case you need an already<br></br>
        whitelisted account, click <u>here</u></h2>
        <br></br>
        <br></br>
        <div className="blockDisplay">Block N° {this.state.blockNumber}</div>
      </div>
    );
  }
}

export default App;
