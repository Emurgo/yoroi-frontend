import React, { Component } from "react";
import WalletStorage from "../state/WalletStorage";
import WalletInfo from "../components/WalletInfo";
import { Tabs, Tab } from "material-ui/Tabs";

class Wallet extends Component {
  constructor(props) {
    super(props);
    //FIXME: This can be passed using props
    this.wallet = WalletStorage.getWallet();
  }
  render() {
    return (
      <Tabs>
        <Tab label="Receive">
          <div>
            <WalletInfo wallet={this.wallet} />
          </div>
        </Tab>
        <Tab label="Send">
          <div>
            <h1>Send FORM</h1>
          </div>
        </Tab>
      </Tabs>
    );
  }
}

export default Wallet;

/*if (this.state.hasWallet) {
  return (<WalletInfo wallet={this.state.wallet} />);
}*/
