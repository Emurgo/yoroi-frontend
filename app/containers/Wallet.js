import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tabs, { Tab } from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import OpenInNew from 'material-ui-icons/OpenInNew';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import NumberFormat from 'react-number-format';
import WalletHistory from '../components/WalletHistory';
import SendAdaForm from '../components/SendAdaForm';
// import Loading from '../components/ui/loading/Loading'; // TODO: Fix styling!
import ExplorerApi from '../api/ExplorerApi';
import { formatCID } from '../utils/formatter';
import copyToClipboard from '../utils/copyToClipboard';
import { openAddress } from '../utils/explorerLinks';
import sendTx from '../cardanoWallet/txSender';
import style from './Wallet.css';

class Wallet extends Component {

  constructor(props) {
    super(props);
    this.state = {
      swapIndex: this.HISTORY_TAB_INDEX,
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
    }, this.props.wallet.xprv).then(this.updateWalletInfo);
  };

  onSwipChange = (index) => {
    this.setState({ swapIndex: index });
  }

  onTabChange = (event, value) => {
    this.setState({ swapIndex: value });
    event.preventDefault();
  };

  getAddress = ({ caAddress }) => {
    return caAddress;
  };

  getBalance = ({ caBalance: { getCoin } }) => {
    return Number(getCoin);
  }

  getTxsHistory = ({ caTxList }) => {
    return caTxList;
  }

  HISTORY_TAB_INDEX = 0;
  SEND_TAB_INDEX = 1;

  updateWalletInfo = () => {
    console.log('[Wallet.updateWalletInfo.run] Running');
    //return ExplorerApi.wallet.getInfo('DdzFFzCqrhtBUjWqcccfjojeiX8M8usSCi6U9N8eeh74qB5nTVZmE3U6iDQnnoxB8Xg6jrCFS1wtByQi7Mn4bhCQrg7GESfM2EcGyUmG')
    return ExplorerApi.wallet.getInfo(this.props.wallet.address)
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
        <div className={style.headerContent}>
          <div className={style.header}>
            <Typography variant="display2" color="inherit">
              {!this.state.loading ? 
                (<NumberFormat thousandSeparator value={this.state.balance} displayType="text" />) :
                '...'
              }
            </Typography>
            {!this.state.loading && <Avatar className={style.symbol} src="img/ada-symbol-smallest-white.inline.svg" /> }
          </div>
          {!this.state.loading &&
            <div className={style.link}>
              <Typography variant="body1" color="inherit" onClick={() => copyToClipboard(this.state.address)}>
                {!this.state.loading ? formatCID(this.state.address) : '...'}
              </Typography>
              <IconButton onClick={() => openAddress(this.state.address)}><OpenInNew style={{ fontSize: 20, color: 'white' }} /></IconButton>
            </div>
          }
        </div>
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
          <SendAdaForm submitPromise={inputs => this.onSendTransaction(inputs)} />
        }
      </div>
    );
  }
}

Wallet.propTypes = {
  wallet: PropTypes.object
};

export default Wallet;
