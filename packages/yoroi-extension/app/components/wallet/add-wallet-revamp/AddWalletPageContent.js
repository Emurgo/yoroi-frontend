
// @flow

import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Box } from '@mui/material'
import ConnectHardwareWalletLogo from '../../../assets/images/add-wallet/connect-hw-revamp.inline.svg';
import CreateWalletLogo from '../../../assets/images/add-wallet/create-wallet-revamp.inline.svg';
import RestoreWalletLogo from '../../../assets/images/add-wallet/restore-wallet-revamp.inline.svg';
import AddWalletCard from './AddWalletCard';


const messages: * = defineMessages({
    createWallet: {
        id: 'wallet.add.page.revamp.createWallet',
        defaultMessage: 'Create new wallet',
    },
    restoreWallet: {
        id: 'wallet.add.page.revamp.restoreWallet',
        defaultMessage: 'Restore existing wallet',
    },
    connectHardwareWallet: {
        id: 'wallet.add.page.revamp.connectHardwareWallet',
        defaultMessage: 'Connect hardware wallet',
    },
});

@observer
export default class AddWalletPageContent extends Component<{||}> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const addWalletOption = [
        {
            imageSrc: CreateWalletLogo,
            label: intl.formatMessage(messages.createWallet),
        },
        {
            imageSrc: RestoreWalletLogo,
            label: intl.formatMessage(messages.restoreWallet),
        },
        {
            imageSrc: ConnectHardwareWalletLogo,
            label: intl.formatMessage(messages.connectHardwareWallet),
        }
    ]

    return (
      <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: '24px',
            mt: '24px',
        }}
      >
        {addWalletOption.map(({ imageSrc, label }) => (
          <AddWalletCard key={label} imageSrc={imageSrc} label={label} />
        ))}
      </Box>
    )
  }
}