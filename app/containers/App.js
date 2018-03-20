import React, { Component } from 'react';
import Toolbar from 'material-ui/Toolbar';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
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
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Icarus Ligth Cardano Wallet - PoC
            </Typography>
          </Toolbar>
        </AppBar>
        {this.renderContent()}
      </div>
    );
  }
}

export default App;
