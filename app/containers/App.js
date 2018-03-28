import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import WalletSetup from '../components/WalletSetup';
import Wallet from '../containers/Wallet';
import WalletStorage from '../state/WalletStorage';

class App extends Component {
  constructor(props) {
    super(props);
    WalletStorage.initWallet();
    this.state = {
      hasWallet: WalletStorage.hasWallet(),
      wallet: WalletStorage.getWallet()
    };
  }

  onWalletCreated = () => {
    this.setState({
      hasWallet: true,
      wallet: WalletStorage.getWallet()
    });
  };

  onLogout = () => {
    WalletStorage.removeWallet();
    this.setState({
      hasWallet: WalletStorage.hasWallet(),
      wallet: WalletStorage.getWallet()
    });
  }

  renderContent = () => {
    if (this.state.hasWallet) {
      return <Wallet wallet={this.state.wallet} onLogout={() => this.onLogout()} />;
    }
    return (<WalletSetup onWalletCreated={this.onWalletCreated} />);
  };

  render() {
    return (
      <div>
        <AppBar position="static" color="primary" />
        {this.renderContent()}
      </div>
    );
  }
}

export default App;
