import React, {Component} from 'react';
import PropTypes from 'prop-types';
import List, {
  ListItem,
  ListItemText
} from 'material-ui/List';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import NumberFormat from 'react-number-format';

import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';

// import Button from 'material-ui/Button';
// import { openTx } from '../utils/explorerLinks';
import {
  formatTransactionID,
  formatTimestamp
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
  
  // TODO: Choose between send or receive
  getSendReceivIconPath = (tx) => {
    console.log("tc", tx);
    if (Math.random() > 0.5) {
      return 'img/send-ic.svg';
    }
    return 'img/receive-ic.svg';
  };
  getTransactionItem = (tx, expandedId, onExpand) => {
    const txId = tx.ctbId;
    return (
      <ExpansionPanel key={txId} expanded={expandedId === txId} onChange={() => onExpand(txId)}>
        <ExpansionPanelSummary classes={{ content: 'expansion-panel-summary-content' }}>
          <Avatar src={this.getSendReceivIconPath(tx)} />
          <div className={style.itemBody}>
            <Typography variant="body1">Received</Typography>
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
        <ExpansionPanelDetails>
          <Typography variant="subheading">Transaction ID</Typography>
          <Typography variant="body2" color="textSecondary">{formatTransactionID(tx.ctbId)}</Typography>
          <Typography variant="body2" color="textSecondary">{formatTimestamp(tx.ctbTimeIssued)}
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  handleItemClick = currExpanded => (clickedId) => {
    const expandedId = currExpanded === clickedId ? '' : clickedId;
    this.setState({ expandedId })
  }

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
      <ListItemText primary="No Transactions History" />
    </ListItem>
  );

  render() {
    const txs = this.props;
    return (
      <List className={style.listContainer}>
        {
          (txs && txs.length !== 0) ?
          this.getTransactionHistoryComponent() : this.getNoTransactionHistoryComponent()
        }
      </List>
    );
  }
};

WalletHistory.propTypes = {
  txs: PropTypes.array
};

export default WalletHistory;
