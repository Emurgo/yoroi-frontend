import React from 'react';
import PropTypes from 'prop-types';
import { toPublicHex } from '../utils/crypto/cryptoUtils';

const WalletInfo = (props) => {
  const showAddress = function (wallet) {
    return toPublicHex(wallet);
  };

  return (
    <div>
      Public address:
      <br />
      {showAddress(props.wallet)}
    </div>
  );
};

WalletInfo.propTypes = {
  wallet: PropTypes.object
};

export default WalletInfo;
