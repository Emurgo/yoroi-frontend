// @flow
import React, { Component } from 'react';
import { defineMessages, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { ellipsis } from '../../utils/strings';
import config from '../../config';
import WalletReceive from '../../components/wallet/WalletReceive';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import NotificationMessage from '../../components/widgets/NotificationMessage';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import successIcon from '../../assets/images/success-small.inline.svg';
import type { InjectedProps } from '../../types/injectedPropsType';

import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';


const messages = defineMessages({
  message: {
    id: 'wallet.receive.page.addressCopyNotificationMessage',
    defaultMessage: '!!!You have successfully copied wallet address',
  },
});

type Props = InjectedProps;

type State = {
  copiedAddress: string,
};

@observer
export default class WalletReceivePage extends Component<Props, State> {

  state = {
    copiedAddress: '',
  };

  componentWillUnmount() {
    this.closeNotification();
    this.resetErrors();
  }

  handleGenerateAddress = () => {
    const { wallets } = this.props.stores.substores.ada;
    const walletIsActive = !!wallets.active;
    if (walletIsActive) {
      this.props.actions.ada.addresses.createAddress.trigger();
    }
  };

  resetErrors = () => {
    this.props.actions.ada.addresses.resetErrors.trigger();
  };

  closeNotification = () => {
    const { wallets } = this.props.stores.substores.ada;
    const wallet = wallets.active;
    if (wallet) {
      const notificationId = `${wallet.id}-copyNotification`;
      this.props.actions.notifications.closeActiveNotification.trigger({ id: notificationId });
    }
  };

  render() {
    const { copiedAddress } = this.state;
    const actions = this.props.actions;
    const { uiNotifications, uiDialogs, profile } = this.props.stores;
    const {
      wallets,
      addresses,
      hwVerifyAddress,
      transactions
    } = this.props.stores.substores.ada;
    const wallet = wallets.active;
    const { validateAmount } = transactions;

    // Guard against potential null values
    if (!wallet) throw new Error('Active wallet required for WalletReceivePage.');

    // get info about the lattest address generated for special rendering
    const walletAddress = addresses.active ? addresses.active.id : '';
    const isWalletAddressUsed = addresses.active ? addresses.active.isUsed : false;

    const walletAddresses = addresses.all.slice().reverse();

    const notification = {
      id: `${wallet.id}-copyNotification`,
      duration: config.wallets.ADDRESS_COPY_NOTIFICATION_DURATION,
      message: (
        <FormattedHTMLMessage
          {...messages.message}
          values={{ walletAddress: ellipsis(copiedAddress, 8) }}
        />
      ),
    };
    const notificationComponent = (
      <NotificationMessage
        icon={successIcon}
        show={uiNotifications.isOpen(notification.id)}
      >
        {notification.message}
      </NotificationMessage>
    );

    const uriCopyNotificationId = `${wallet.id}-uri-copyNotification`;

    return (
      <VerticalFlexContainer>
        <WalletReceive
          walletAddress={walletAddress}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
          isWalletAddressUsed={isWalletAddressUsed}
          walletAddresses={walletAddresses}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddress={(address) => {
            this.setState({ copiedAddress: address });
            actions.notifications.open.trigger({
              id: notification.id,
              duration: notification.duration,
              message: messages.message
            });
          }}
          onVerifyAddress={({ address, path }) => {
            actions.ada.hwVerifyAddress.selectAddress.trigger({ address, path });
            this.openVerifyAddressDialog();
          }}
          onGeneratePaymentURI={(address) => {
            this.openURIGenerateDialog(address);
          }}
          isSubmitting={addresses.createAddressRequest.isExecuting}
          error={addresses.error}
        />

        {notificationComponent}

        {uiDialogs.isOpen(URIGenerateDialog) ? (
          <URIGenerateDialog
            walletAddress={uiDialogs.getParam('address')}
            amount={uiDialogs.getParam('amount')}
            onClose={() => actions.dialogs.closeActiveDialog.trigger()}
            onGenerate={(address, amount) => { this.generateURI(address, amount); }}
            classicTheme={profile.isClassicTheme}
            currencyMaxIntegerDigits={MAX_INTEGER_PLACES_IN_ADA}
            currencyMaxFractionalDigits={DECIMAL_PLACES_IN_ADA}
            validateAmount={validateAmount}
          />
        ) : null}

        {uiDialogs.isOpen(URIDisplayDialog) ? (
          <URIDisplayDialog
            address={uiDialogs.getParam('address')}
            amount={uiDialogs.getParam('amount')}
            onClose={() => actions.dialogs.closeActiveDialog.trigger()}
            onBack={() => this.openURIGenerateDialog(
              uiDialogs.getParam('address'),
              uiDialogs.getParam('amount'),
            )}
            showNotification={uiNotifications.isOpen(uriCopyNotificationId)}
            onCopy={(message) => actions.notifications.open.trigger({
              id: uriCopyNotificationId,
              duration: config.wallets.ADDRESS_COPY_NOTIFICATION_DURATION,
              message
            })}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(VerifyAddressDialog) && hwVerifyAddress.selectedAddress ? (
          <VerifyAddressDialog
            isActionProcessing={hwVerifyAddress.isActionProcessing}
            selectedExplorer={this.props.stores.profile.selectedExplorer}
            error={hwVerifyAddress.error}
            walletAddress={hwVerifyAddress.selectedAddress.address}
            walletPath={hwVerifyAddress.selectedAddress.path}
            isHardware={wallet.isHardwareWallet}
            verify={() => actions.ada.hwVerifyAddress.verifyAddress.trigger({ wallet })}
            cancel={() => actions.ada.hwVerifyAddress.closeAddressDetailDialog.trigger()}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

      </VerticalFlexContainer>
    );
  }

  openVerifyAddressDialog = (): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({ dialog: VerifyAddressDialog });
  }

  openURIGenerateDialog = (address: string, amount?: number): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({
      dialog: URIGenerateDialog,
      params: { address, amount }
    });
  }

  generateURI = (address: string, amount: number) => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({
      dialog: URIDisplayDialog,
      params: { address, amount }
    });
  }
}
