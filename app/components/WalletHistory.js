import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import List, {
  ListItem,
  ListItemText
} from 'material-ui/List';
import { FormGroup } from 'material-ui/Form';
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
      <Grid item xs={12}>
        <Button onClick={() => openTx(tx.ctbId)}>
          <ListItem >
            <FormGroup>
              <ListItemText primary={`Tx Hash: ${formatCID(tx.ctbId)}`} />
              <p>
                <span> Timestamp: { formatTimestamp(tx.ctbTimeIssued) }</span>
                <br />
                <span> Amount: { getAmount(tx) } </span>
              </p>
            </FormGroup>
          </ListItem>
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
