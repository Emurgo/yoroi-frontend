import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
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

  renderContent = () => {
    if (this.state.hasWallet) {
      return <Wallet wallet={this.state.wallet} />;
    }
    return (<WalletSetup onWalletCreated={this.onWalletCreated} />);
  };

  render() {
    return (
      <div>
        <MuiThemeProvider>{this.renderContent()}</MuiThemeProvider>
      </div>
    );
  }
}

export default App;
