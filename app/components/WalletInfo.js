import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
} from 'material-ui/Card';
import {
  List,
  ListItem
} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton';
import {
  formatCID,
  formatTimestamp
} from '../utils/formatter';
import {
  openTx,
  openAddress
} from '../utils/explorerLinks';

const WalletInfo = (props) => {
  const getAmount = ({ ctbOutputSum: { getCoin } }) => {
    return Number(getCoin);
  };

  const getTransactionItem = (tx, index) => {
    return (
      <ListItem
        key={index}
        primaryText={`Tx Hash: ${formatCID(tx.ctbId)}`}
        secondaryText={
          <p>
            <span> Timestamp: { formatTimestamp(tx.ctbTimeIssued) }</span>
            <br />
            <span> Amount: { getAmount(tx) } </span>
          </p>
        }
        secondaryTextLines={2}
        onClick={() => openTx(tx.ctbId)}
      />
    );
  };

  const getTransactionsItems = (txs) => {
    return txs.map((tx, index) => {
      return getTransactionItem(tx, index);
    });
  };

  const getTransactionHistoryComponent = () => (
    <div>
      <Subheader> Transactions History </Subheader>
      {getTransactionsItems(props.txs)}
    </div>
  );

  const getNoTransactionHistoryComponent = () => (
    <div>
      <Subheader> No Transactions History </Subheader>
    </div>
  );

  return (
    <Card>
      <FlatButton
        label={`Address: ${formatCID(props.address)}`}
        onClick={() => openAddress(props.address)}
      />
      <CardHeader title={`Balance: ${props.balance}`} />
      <List>
        {
          (props.txs && props.txs.length !== 0) ?
          getTransactionHistoryComponent() : getNoTransactionHistoryComponent()
        }
      </List>
    </Card>
  );
};

WalletInfo.propTypes = {
  address: PropTypes.string,
  balance: PropTypes.number,
  txs: PropTypes.array
};

export default WalletInfo;
