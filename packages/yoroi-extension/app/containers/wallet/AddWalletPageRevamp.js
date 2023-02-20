// @flow
import { Component } from 'react';
import type { Node } from 'react';
import AddWalletPageHeader from '../../components/wallet/add-wallet-revamp/AddWalletPageHeader';
import { Box } from '@mui/material';
import AddWalletPageContent from '../../components/wallet/add-wallet-revamp/AddWalletPageContent';

export default class AddWalletPageRevamp extends Component {
  render(): Node {
    return (
      <Box>
        <AddWalletPageHeader />
        <AddWalletPageContent />
      </Box>
    )
  }
}