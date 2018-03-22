import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tabs, { Tab } from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import WalletHistory from '../components/WalletHistory';
import SendAdaForm from '../components/SendAdaForm';
// import Loading from '../components/ui/loading/Loading'; // TODO: Fix styling!
import ExplorerApi from '../api/ExplorerApi';
import { toPublicHex } from '../utils/crypto/cryptoUtils';
import { formatCID } from '../utils/formatter';
import { openAddress } from '../utils/explorerLinks';
import sendTx from '../utils/txSender';

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
    return sendTx({
      to: inputs.to,
      from: this.state.address,
      amount: inputs.amount
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
  SEND_TAB_INDEX = 1;

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
        <Card>
          <CardContent>
            <Typography variant="headline">
              <Button onClick={() => openAddress(this.state.address)} >
                Address: {!this.state.loading ? formatCID(this.state.address) : '...'}
              </Button>
            </Typography>
            <Typography variant="subheading" color="textSecondary">
              <Button disabled>
                Balance: {!this.state.loading ? this.state.balance : '...'}
              </Button>
            </Typography>
          </CardContent>
        </Card>
        <AppBar position="static" color="default">
          <Tabs value={this.state.swapIndex} onChange={this.onTabChange} fullWidth>
            <Tab label="History" />
            <Tab label="Send" />
          </Tabs>
        </AppBar>
        { this.state.swapIndex === this.HISTORY_TAB_INDEX &&
          (!this.state.loading ?
            <WalletHistory
              txs={this.state.txsHistory}
            />
          :
            ''
          )
        }
        { this.state.swapIndex === this.SEND_TAB_INDEX &&
          <SendAdaForm onSubmit={inputs => this.onSendTransaction(inputs)} />
        }
      </div>
    );
  }
}

Wallet.propTypes = {
  wallet: PropTypes.object
};

export default Wallet;
