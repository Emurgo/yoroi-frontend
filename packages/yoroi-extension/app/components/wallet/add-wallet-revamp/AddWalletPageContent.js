
// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Box } from '@mui/material'
import ConnectHardwareWalletLogo from '../../../assets/images/add-wallet/connect-hw-revamp.inline.svg';
import CreateWalletLogo from '../../../assets/images/add-wallet/create-wallet-revamp.inline.svg';
import RestoreWalletLogo from '../../../assets/images/add-wallet/restore-wallet-revamp.inline.svg';
import AddWalletCard from './AddWalletCard';


const messages: any = defineMessages({
  createWallet: {
    id: 'wallet.add.page.revamp.createWallet',
    defaultMessage: '!!!Create new wallet',
  },
  restoreWallet: {
    id: 'wallet.add.page.revamp.restoreWallet',
    defaultMessage: '!!!Restore existing wallet',
  },
  connectHardwareWallet: {
    id: 'wallet.add.page.revamp.connectHardwareWallet',
    defaultMessage: '!!!Connect hardware wallet',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  +onCreate: void => void,
  +onRestore: void => void,
  +onHardwareConnect: void => void,
|};

function AddWalletPageContent(props: Props & Intl): Node {
  const { intl, onCreate, onRestore, onHardwareConnect } =  props;
  const addWalletOption = [
    {
      imageSrc: CreateWalletLogo,
      label: intl.formatMessage(messages.createWallet),
      onClick: onCreate,
      id: 'createWalletButton'
    },
    {
      imageSrc: RestoreWalletLogo,
      label: intl.formatMessage(messages.restoreWallet),
      onClick: onRestore,
      id: 'restoreWalletButton'
    },
    {
      imageSrc: ConnectHardwareWalletLogo,
      label: intl.formatMessage(messages.connectHardwareWallet),
      onClick: onHardwareConnect,
      id: 'connectHardwareWalletButton'
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
      {addWalletOption.map((option) => (
        <AddWalletCard key={option.label} {...option} />
      ))}
    </Box>
  )
}
export default (injectIntl(observer(AddWalletPageContent)): ComponentType<Props>);