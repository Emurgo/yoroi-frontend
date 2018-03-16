import React from 'react';
import PropTypes from 'prop-types';
import ImportWalletForm from '../components/ImportWalletForm';
import { generateWallet } from '../utils/crypto/cryptoUtils';
import WalletStorage from '../state/WalletStorage';

const WalletSetup = (props) => {
  const importWallet = (secretWords) => {
    const wallet = generateWallet(secretWords);
    WalletStorage.setWallet(wallet);
    props.onWalletCreated();
  };

  return (<ImportWalletForm onSubmit={importWallet} />);
};

WalletSetup.propTypes = {
  onWalletCreated: PropTypes.func
};

export default WalletSetup;
