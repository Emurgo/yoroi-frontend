import React, { Component } from 'react';
import PropTypes from 'prop-types';
import List, {
  ListItem,
  ListItemText
} from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import NumberFormat from 'react-number-format';
import OpenInNew from 'material-ui-icons/OpenInNew';
import IconButton from 'material-ui/IconButton';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import { openTx } from '../utils/explorerLinks';
import {
  formatTransactionID,
  formatTimestamp,
  formatRawTimestamp
} from '../utils/formatter';
import style from './WalletHistory.css';

class WalletHistory extends Component {

  constructor() {
    super();
    this.state = {};
  }

  getAmount = ({ ctbOutputSum: { getCoin } }) => {
    return Number(getCoin) / 1000000;
  };

  getSendReceivIconPath = (tx) => {
    return tx.isOutgoing ? 'img/send-ic.svg' : 'img/receive-ic.svg';
  }

  getSendReceiveText = (tx) => { return tx.isOutgoing ? 'Sent' : 'Received'; }

  getTransactionItem = (tx, expandedId, onExpand) => {
    const txId = tx.ctbId;
    return (
      <ExpansionPanel key={txId} expanded={expandedId === txId} onChange={() => onExpand(txId)}>
        <ExpansionPanelSummary className={style.expansionPanelSummary}>
          <Avatar src={this.getSendReceivIconPath(tx)} />
          <div className={style.itemBody}>
            <Typography variant="body1">{this.getSendReceiveText(tx)}</Typography>
          </div>
          <div className={style.amount}>
            <div>
              <Typography variant="subheading">
                <NumberFormat thousandSeparator value={this.getAmount(tx)} displayType="text" suffix=" ADA" />
              </Typography>
            </div>
            <div>
              <Typography variant="body2" color="textSecondary">{formatTimestamp(tx.ctbTimeIssued)}</Typography>
            </div>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={style.expansionPanelDetails}>
          <Typography variant="subheading">Transaction ID</Typography>
          <div className={style.link}>
            <Typography variant="body2" color="textSecondary">{formatTransactionID(tx.ctbId)}</Typography>
            <IconButton onClick={() => openTx(tx.ctbId)}><OpenInNew color="disabled" style={{ fontSize: 20 }} /></IconButton>
          </div>
          <Typography variant="subheading">Timestamp</Typography>
          <Typography variant="body2" color="textSecondary">{formatRawTimestamp(tx.ctbTimeIssued)}
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  getTransactionsItems = (txs) => {
    const currExpanded = this.state.expandedId;
    return txs.map((tx) => {
      return this.getTransactionItem(tx, currExpanded, this.handleItemClick(currExpanded));
    });
  };

  getTransactionHistoryComponent = () => {
    return this.getTransactionsItems(this.props.txs, this.state.expanded);
  };

  getNoTransactionHistoryComponent = () => (
    <ListItem>
      <ListItemText align="center" primary="No Transactions History" />
    </ListItem>
  );

  handleItemClick = currExpanded => (clickedId) => {
    const expandedId = currExpanded === clickedId ? '' : clickedId;
    this.setState({ expandedId });
  }

  render() {
    const txs = this.props.txs;
    return (
      <List>
        {
          (txs && txs.length !== 0) ?
          this.getTransactionHistoryComponent() : this.getNoTransactionHistoryComponent()
        }
      </List>
    );
  }
}

WalletHistory.propTypes = {
  txs: PropTypes.array
};

export default WalletHistory;
