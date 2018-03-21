import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tabs, { Tab } from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import SwipeableViews from 'react-swipeable-views';
import { FormGroup } from 'material-ui/Form';
import Button from 'material-ui/Button';
import WalletHistory from '../components/WalletHistory';
import SendAdaForm from '../components/SendAdaForm';
import Loading from '../components/ui/loading/Loading';
import ExplorerApi from '../api/ExplorerApi';
import CardanoNodeApi from '../api/CardanoNodeApi';
import { toPublicHex } from '../utils/crypto/cryptoUtils';
import { formatCID } from '../utils/formatter';
import { openAddress } from '../utils/explorerLinks';

class Wallet extends Component {

  constructor(props) {
    super(props);
    this.state = {
      swapIndex: this.HISTORY_TAB_INDEX,
      address: toPublicHex(this.props.wallet), // TODO: Change to a correct format
      balance: -1,
      txsHistory: [],
      loading: true
    };
  }

  componentWillMount() {
    this.updateWalletInfo()
    .then(() => {
      this.setState({
        intervalId: setInterval(this.updateWalletInfo, 15 * 1000),
        loading: false
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  onSendTransaction = (inputs) => {
    // Here we will need to call create transaction endpoint
    const payload = {
      to: inputs.to,
      from: this.state.address,
      amount: inputs.amount
    };
    return CardanoNodeApi.transactions.buildTx(payload)
    .then((result) => {
      console.log('[Wallet.onSendTransaction] Ok!', result);
      this.swapToHistoryTab();
      return Promise.resolve();
    });
  };

  onSwipChange = (index) => {
    this.setState({ swapIndex: index });
  }

  onTabChange = (event, value) => {
    this.setState({ swapIndex: value });
    event.preventDefault();
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

  HISTORY_TAB_INDEX = 0;

  swapToHistoryTab = () => {
    this.setState({
      swapIndex: this.HISTORY_TAB_INDEX
    });
  }

  updateWalletInfo = () => {
    console.log('[Wallet.updateWalletInfo.run] Running');
    // ExplorerApi.wallet.getInfo(this.props.wallet)
    return ExplorerApi.wallet.getInfo('DdzFFzCqrhsq3S51xpvLmBZrtBCHNbRQX8q3eiaR6HPLJpSakXQXrczPRiqCvLMMdNhdKBmoU7ovjyMcVDngBsuLHA66qPnYUvvJVveL')
    .then((walletInfo) => {
      this.setState({
        address: this.getAddress(walletInfo),
        balance: this.getBalance(walletInfo),
        txsHistory: this.getTxsHistory(walletInfo)
      });
      return Promise.resolve();
    });
  }

  render() {
    return (
      <div>
        <FormGroup>
          <Button onClick={() => openAddress(this.state.address)} >
            Address: {!this.state.loading ? formatCID(this.state.address) : '...'}
          </Button>
          <Button disabled> Balance: {!this.state.loading ? this.state.balance : '...'} </Button>
        </FormGroup>
        <AppBar position="static" color="default">
          <Tabs value={this.state.swapIndex} onChange={this.onTabChange} fullWidth>
            <Tab label="History" />
            <Tab label="Send" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis="x-reverse"
          index={this.state.swapIndex}
          onChangeIndex={this.onSwipChange}
        >
          {
            !this.state.loading ?
              <WalletHistory
                txs={this.state.txsHistory}
              />
            :
              <Loading />
          }
          <SendAdaForm onSubmit={inputs => this.onSendTransaction(inputs)} />
        </SwipeableViews>
      </div>
    );
  }
}

Wallet.propTypes = {
  wallet: PropTypes.object
};

export default Wallet;
