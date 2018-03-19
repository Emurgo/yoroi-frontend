import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import WalletInfo from '../components/WalletInfo';
import API from '../api/API';
import { toPublicHex } from '../utils/crypto/cryptoUtils';

class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: toPublicHex(this.props.wallet), // TODO: Change to a correct format
      balance: -1,
      txsHistory: []
    };
  }

  componentWillMount() {
    // TODO: Swap lines
    // API.wallet.getInfo(this.props.wallet)
    API.wallet.getInfo('DdzFFzCqrhsq3S51xpvLmBZrtBCHNbRQX8q3eiaR6HPLJpSakXQXrczPRiqCvLMMdNhdKBmoU7ovjyMcVDngBsuLHA66qPnYUvvJVveL')
    .then((walletInfo) => {
      this.setState({
        address: this.getAddress(walletInfo),
        balance: this.getBalance(walletInfo),
        txsHistory: this.getTxsHistory(walletInfo)
      });
    });
  }

  getAddress = ({ Right: { caAddress } }) => {
    return caAddress;
  };

  getBalance = ({ Right: { caBalance: { getCoin } } }) => {
    return Number(getCoin);
  }

  getTxsHistory = ({ Right: { caTxList } }) => {
    return caTxList;
  }

  render() {
    return (
      <Tabs>
        <Tab label="My Wallet">
          <div>
            <WalletInfo
              address={this.state.address}
              balance={this.state.balance}
              txs={this.state.txsHistory}
            />
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

Wallet.propTypes = {
  wallet: PropTypes.object
};

export default Wallet;
