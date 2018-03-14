import React from 'react';
import PropTypes from 'prop-types';
import { HdWallet } from 'rust-cardano-crypto';
import { Buffer } from 'safe-buffer';

const WalletInfo = (props) => {
  const showAddress = function (wallet) {
    const pk = HdWallet.toPublic(wallet);
    const pkHex = Buffer.from(pk).toString('hex');
    return `0x${pkHex}`;
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
