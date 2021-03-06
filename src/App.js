import React, { Component } from 'react'
import MultiSigWallet from '../build/contracts/MultiSigWallet.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    // Items in component's state
    this.state = {
      multiSigContract: null,
      web3: null,
      /// Where we track all events emit by the contract for display
      events: [],
      numEvents: 0,
      lastTxHash: 0
    }

    this.sendEther = this.sendEther.bind(this);
    this.watchLogs = this.watchLogs.bind(this);

  }

  componentWillMount() {

    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
    // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.');
    })

  }

  instantiateContract() {
    const contract = require('truffle-contract');
    const multiSig = contract(MultiSigWallet);
    multiSig.setProvider(this.state.web3.currentProvider);
    console.log(this.state.web3.currentProvider);
    multiSig.deployed().then((instance) => {
      /// Save our contract obj in internal state
      this.setState({multiSigContract: instance})
    }).then(() => this.watchLogs())
  }


  /// TODO: Finish implementing the watchLogs() function. This should watch for all the events
  /// that we define in lines 61-64. Most of this is implemented. There are just a few pieces
  /// for you to fill in. This should give you practice working with the state object in
  /// reactJs.

  watchLogs() {
    var depositFundsEvent = this.state.multiSigContract.DepositFunds();
    var transactionCreatedEvent = this.state.multiSigContract.TransactionCreated();
    var transactionCompletedEvent = this.state.multiSigContract.TransactionCompleted();
    var transactionSignedEvent = this.state.multiSigContract.TransactionSigned();

    /// save reference to global component obj for later user
    var that = this;

    depositFundsEvent.watch(function(error, result) {
      if (error) {
        console.log(error);
      } else {
        /// YOUR CODE HERE -- what do we need to do if we want to log a component?
        /// 'result.event' will give you the event itself, so try adding that to the
        /// list of events we are tracking in the state object. REMEMBER TO USE 'that'
        /// instead of 'this'. You can use 'that.state.item' to access 'item' from the state
        /// and 'that.setState({item: value})' to reset the value of 'item' to 'value'
        console.log(result);
        if (result.transactionHash !== that.state.lastTxHash) {
          that.setState({events: that.state.events.concat(result.event)});
          that.setState({numEvents: that.state.numEvents + 1});
          that.setState({lastTxHash: result.transactionHash});
        }
      }
    })

    transactionCreatedEvent.watch(function(error, result) {
      if (error) {
        console.log(error);
      } else {
        that.setState({events: that.state.events.concat(result.event)});
        that.setState({numEvents: that.state.numEvents + 1});
      }
    })

    transactionCompletedEvent.watch(function(error, result) {
      if (error) {
        console.log(error);
      } else {
        that.setState({events: that.state.events.concat(result.event)});
        that.setState({numEvents: that.state.numEvents + 1});
      }
    })

    transactionSignedEvent.watch(function(error, result) {
      if (error) {
        console.log(error);
      } else {
        that.setState({events: that.state.events.concat(result.event)});
        that.setState({numEvents: that.state.numEvents + 1});
      }
    })
  }

  /// TODO: Implement the sendEther function, which is called when we click the
  /// "Send Ether" button in the browser. Use the web3 object from this react component's
  /// state (i.e. 'this.state.web3.....'). You'll want to use the 'sendTransaction'
  /// function, which is documented here -- https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsendtransaction
  sendEther() {
    console.log(this.state.multiSigContract);
    this.state.web3.eth.sendTransaction({from: this.state.web3.eth.coinbase, to: this.state.multiSigContract.address, value:100}, () => {console.log('Sending ether.');});

  }

  render() {
    return (
      <div className="body">
        <h1>Full Stack Dapp: Event Logging</h1>
        <h3>Here you'll see events logged by the multi-sig contract you implemented. First click the button below. Behind the scenes this is sending ether to the multi-sig contract. Accordingly, we'll see the DepositFunds event logged below.</h3>
        <ul>
          {this.state.events.map(function(event){
            return <li className="list-item">{event}</li>;
          })}
        </ul>
        <button onClick={this.sendEther} className="ether-btn">Send Ether</button>
      </div>
    );
  }

}

export default App
