import React, { Component } from "react";
import PropTypes from "prop-types";
import ImportWalletForm from "../components/ImportWalletForm";
import { generateWallet } from "../utils/crypto/cryptoUtils";
import WalletStorage from "../state/WalletStorage";

class WalletSetup extends Component {
  importWallet = secretWords => {
    const wallet = generateWallet(secretWords);
    WalletStorage.setWallet(wallet);
    this.props.onWalletCreated();
  };

  render() {
    return <ImportWalletForm onSubmit={this.importWallet} />;
  }
}

WalletSetup.propTypes = {
  onWalletCreated: PropTypes.func
};

export default WalletSetup;
