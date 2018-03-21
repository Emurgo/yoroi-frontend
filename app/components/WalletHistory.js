import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import List, {
  ListItem,
  ListItemText
} from 'material-ui/List';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import {
  formatCID,
  formatTimestamp
} from '../utils/formatter';
import { openTx } from '../utils/explorerLinks';

const WalletHistory = (props) => {
  const getAmount = ({ ctbOutputSum: { getCoin } }) => {
    return Number(getCoin);
  };

  const getTransactionItem = (tx) => {
    return (
      <Grid item>
        <Button onClick={() => openTx(tx.ctbId)}>
          <Card>
            <CardContent>
              <Typography align="left">
                Tx Hash: { formatCID(tx.ctbId) }
              </Typography>
              <Typography align="left" variant="body2" color="textSecondary" >
                Timestamp: { formatTimestamp(tx.ctbTimeIssued) }
              </Typography>
              <Typography align="left" variant="body1" color="textSecondary">
                Amount: { getAmount(tx) }
              </Typography>
            </CardContent>
          </Card>
        </Button>
      </Grid>
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
    <Grid container justify="center">
      <List>
        {
          (props.txs && props.txs.length !== 0) ?
          getTransactionHistoryComponent() : getNoTransactionHistoryComponent()
        }
      </List>
    </Grid>
  );
};

WalletHistory.propTypes = {
  txs: PropTypes.array
};

export default WalletHistory;
