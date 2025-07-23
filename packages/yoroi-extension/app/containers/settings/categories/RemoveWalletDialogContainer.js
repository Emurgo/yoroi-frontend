// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { defineMessages, IntlContext } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { messages } from '../../../components/wallet/settings/RemoveWallet';

import DangerousActionDialog from '../../../components/widgets/DangerousActionDialog';
import { Typography } from '@mui/material';
import type { StoresProps } from '../../../stores';

type Props = {|
  publicDeriverId: number,
|};
type AllProps = {| ...Props, ...StoresProps |};

type State = {|
  warning1Text: ?$npm$ReactIntl$MessageDescriptor,
  warning2Text: ?$npm$ReactIntl$MessageDescriptor,
  acceptText: ?$npm$ReactIntl$MessageDescriptor,
|};

const dialogMessages = defineMessages({
  warning2: {
    id: 'wallet.settings.delete.warning2',
    defaultMessage:
      '!!!Please double-check you still have the means to restore access to this wallet.' +
      ' If you cannot, removing the wallet may result in irreversible loss of funds.',
  },
  accept: {
    id: 'wallet.settings.delete.accept',
    defaultMessage: '!!!I still have the means to restore this wallet',
  },
  cashbackWarning1: {
    id: 'wallet.settings.delete.warning1.cashback',
    defaultMessage: '!!!Removing this wallet will not impact its balance, but as it is the rewards wallet, this may disrupt your cashback process. You can also use another wallet for connecting the cashback before removing this wallet.'
  },
  cashbackWarning2: {
    id: 'wallet.settings.delete.warning2.cashback',
    defaultMessage: '!!!This wallet can be restored again at any time, but double-check if you still have the means to restore access to it. If you cannot, removing the wallet may result in irreversible loss of funds.'
  },
  cashbackAccept: {
    id: 'wallet.settings.delete.accept.cashback',
    defaultMessage: '!!!I still have the means to restore this wallet and want to stop generating cashback rewards for this wallet.'
  },
});

@observer
export default class RemoveWalletDialogContainer extends Component<AllProps, State> {
  state: State = {
    warning1Text: null,
    warning2Text: null,
    acceptText: null,
  }

  static contextType:any = IntlContext;
  componentWillUnmount() {
    this.props.stores.walletSettings.removeWalletRequest.reset();
  }

  async componentDidMount() {
    const { wallets } = this.props.stores;
    if (await wallets.getCashbackWallet() === wallets.selected) {
      this.setState({
        warning1Text: dialogMessages.cashbackWarning1,
        warning2Text: dialogMessages.cashbackWarning2,
        acceptText: dialogMessages.cashbackAccept,
      });
    } else {
      this.setState({
        warning1Text: messages.removeExplanation,
        warning2Text: dialogMessages.warning2,
        acceptText: dialogMessages.accept,
      });
    }
  }

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    if (this.props.stores.walletSettings.removeWalletRequest.isExecuting) return;
    this.isChecked = !this.isChecked;
  };

  removeWalletRevamp: void => Promise<void> = async () => {
    return this.props.stores.walletSettings.removeWallet({
      publicDeriverId: this.props.publicDeriverId,
    });
  };

  render(): Node {
    const intl = this.context;
    const settingsStore = this.props.stores.walletSettings;

    const { warning1Text, warning2Text, acceptText } = this.state;
    if (!warning1Text || !warning2Text || !acceptText) {
      return null;
    }

    return (
      <DangerousActionDialog
        title={intl.formatMessage(messages.titleLabel)}
        checkboxAcknowledge={intl.formatMessage(acceptText)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        isSubmitting={settingsStore.removeWalletRequest.isExecuting}
        error={settingsStore.removeWalletRequest.error}
        onCancel={this.props.stores.uiDialogs.closeActiveDialog}
        primaryButton={{
          label: intl.formatMessage(globalMessages.remove),
          onClick: this.removeWalletRevamp,
        }}
        secondaryButton={{
          onClick: this.props.stores.uiDialogs.closeActiveDialog,
        }}
        id="removeWalletDialog"
      >
        <Typography varint="body1" sx={{ color: 'ds.text_gray_medium' }}>
          {intl.formatMessage(warning1Text)}
        </Typography>
        <Typography varint="body1" sx={{ color: 'ds.text_gray_medium' }}>
          {' '}
          {intl.formatMessage(warning2Text)}
        </Typography>
      </DangerousActionDialog>
    );
  }
}
