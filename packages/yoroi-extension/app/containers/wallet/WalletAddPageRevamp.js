// @flow
import { Component } from 'react';
import type { Node } from 'react';
import AddWalletPageHeader from '../../components/wallet/add-wallet-revamp/AddWalletPageHeader';
import { Box } from '@mui/material';
import AddWalletPageContent from '../../components/wallet/add-wallet-revamp/AddWalletPageContent';


// Todo: Fix all names from `WalletAddPage` into `AddWalletPage`
export default class AddWalletPage extends Component {
    render(): Node {
        return (
          <Box>
            <AddWalletPageHeader />
            <AddWalletPageContent />
          </Box>
        )
    }
}