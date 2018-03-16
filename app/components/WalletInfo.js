import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import {
  Card,
  CardHeader,
  CardMedia,
  CardTitle
} from 'material-ui/Card';

const WalletInfo = (props) => {
  return (
    <Card>
      <CardHeader title="My Wallet" />
      <CardMedia>
        <div>
          <QRCode value={props.address} />
        </div>
      </CardMedia>
      <CardTitle title="" subtitle={props.address} />
    </Card>
  );
};

WalletInfo.propTypes = {
  address: PropTypes.string,
  balance: PropTypes.number,
  txs: PropTypes.array
};

export default WalletInfo;
