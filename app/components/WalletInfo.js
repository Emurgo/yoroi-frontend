import React from "react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText
} from "material-ui/Card";

import { toPublicHex } from "../utils/crypto/cryptoUtils";

const WalletInfo = props => {
  const showAddress = function(wallet) {
    return toPublicHex(wallet);
  };

  const address = showAddress(props.wallet);

  return (
    <Card>
      <CardHeader title="My Wallet" />
      <CardMedia>
        <div>
          <QRCode value={address} />
        </div>
      </CardMedia>
      <CardTitle title="" subtitle={address} />
    </Card>
  );
};

WalletInfo.propTypes = {
  wallet: PropTypes.object
};

export default WalletInfo;
