import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import WalletInfo from '../components/WalletInfo';
import SendAdaForm from '../components/SendAdaForm';
import ExplorerApi from '../api/ExplorerApi';
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
    this.setState({
      intervalId: this.updateWalletInfo()
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  onSendTransaction = (inputs) => {
    // Here we will need to call create transaction endpoint
    alert(`OnSendTransaction ${JSON.stringify(inputs)}`);
  };

  getAddress = ({ Right: { caAddress } }) => {
    return caAddress;
  };

  getBalance = ({ Right: { caBalance: { getCoin } } }) => {
    return Number(getCoin);
  }

  getTxsHistory = ({ Right: { caTxList } }) => {
    return caTxList;
  }

  updateWalletInfo = () => {
    function run() {
      console.log('[Wallet.updateWalletInfo.run] Running');
      // TODO: Swap lines
      // ExplorerApi.wallet.getInfo(this.props.wallet)
      ExplorerApi.wallet.getInfo('DdzFFzCqrhsq3S51xpvLmBZrtBCHNbRQX8q3eiaR6HPLJpSakXQXrczPRiqCvLMMdNhdKBmoU7ovjyMcVDngBsuLHA66qPnYUvvJVveL')
      .then((walletInfo) => {
        this.setState({
          address: this.getAddress(walletInfo),
          balance: this.getBalance(walletInfo),
          txsHistory: this.getTxsHistory(walletInfo)
        });
      });
    }
    return setInterval(run.bind(this), 15 * 1000);
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
            <SendAdaForm onSubmit={inputs => this.onSendTransaction(inputs)} />
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
