import React, { Component } from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Tabs, Tab } from "material-ui/Tabs";
import FontIcon from "material-ui/FontIcon";
import MapsPersonPin from "material-ui/svg-icons/maps/person-pin";
import WalletSetup from "../containers/WalletSetup";
import Wallet from "../containers/Wallet";

import WalletStorage from "../state/WalletStorage";

const Receive = () => {
  return <h1>Receive</h1>;
};
const Send = () => {
  return <h1>Send</h1>;
};

class App extends Component {
  constructor() {
    super();
    WalletStorage.initWallet();
    this.state = {
      hasWallet: WalletStorage.hasWallet()
    };
  }

  renderContent = () => {
    if (this.state.hasWallet) {
      return <Wallet />;
    } else
      return (
        <WalletSetup
          onWalletCreated={() => this.setState({ hasWallet: true })}
        />
      );
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
