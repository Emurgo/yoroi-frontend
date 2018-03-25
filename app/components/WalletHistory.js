import React from 'react';
import PropTypes from 'prop-types';
import List, {
  ListItem,
  ListItemText
} from 'material-ui/List';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import NumberFormat from 'react-number-format';
// import Button from 'material-ui/Button';
// import { openTx } from '../utils/explorerLinks';
import {
  formatTransactionID,
  formatTimestamp
} from '../utils/formatter';
import style from './WalletHistory.css';

const WalletHistory = (props) => {
  const getAmount = ({ ctbOutputSum: { getCoin } }) => {
    return Number(getCoin) / 1000000;
  };
  // TODO: Choose between send or receive
  const getSendReceivIconPath = (tx) => {
    console.log("tc", tx);
    if (Math.random() > 0.5) {
      return 'img/send-ic.svg';
    }
    return 'img/receive-ic.svg';
  };
  const getTransactionItem = (tx) => {
    return (
      <Card>
        <CardContent className={style.cardContent}>
          <Avatar src={getSendReceivIconPath(tx)} />
          <div className={style.itemBody}>
            <Typography variant="title">Ada received</Typography>
            <Typography variant="body2" color="textSecondary">{formatTimestamp(tx.ctbTimeIssued)}</Typography>
            <Typography variant="subheading">Transaction ID</Typography>
            <Typography variant="body2" color="textSecondary">{formatTransactionID(tx.ctbId)}</Typography>
          </div>
          <div className={style.amount}>
            <Typography variant="subheading">
              <NumberFormat thousandSeparator value={getAmount(tx)} displayType="text" suffix=" ADA" />
            </Typography>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTransactionsItems = (txs) => {
    return txs.map((tx, index) => {
      return getTransactionItem(tx, index);
    });
  };

  const getTransactionHistoryComponent = () => {
    return getTransactionsItems(props.txs);
  };

  const getNoTransactionHistoryComponent = () => (
    <ListItem>
      <ListItemText primary="No Transactions History" />
    </ListItem>
  );

  return (
    <List className={style.listContainer}>
      {
        (props.txs && props.txs.length !== 0) ?
        getTransactionHistoryComponent() : getNoTransactionHistoryComponent()
      }
    </List>
  );
};

WalletHistory.propTypes = {
  txs: PropTypes.array
};

export default WalletHistory;
