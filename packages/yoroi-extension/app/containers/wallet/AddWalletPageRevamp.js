// @flow
import type { Node } from 'react';
import AddWalletPageHeader from '../../components/wallet/add-wallet-revamp/AddWalletPageHeader';
import { Box } from '@mui/material';
import AddWalletPageContent from '../../components/wallet/add-wallet-revamp/AddWalletPageContent';

export default function AddWalletPageRevamp(): Node {
  return (
    <Box>
      <AddWalletPageHeader />
      <AddWalletPageContent />
    </Box>
  )
}