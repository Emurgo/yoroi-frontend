// @flow
import React, { Component } from 'react';
import { defineMessages, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { ellipsis } from '../../utils/strings';
import config from '../../config';
import WalletReceive from '../../components/wallet/WalletReceive';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import NotificationMessage from '../../components/widgets/NotificationMessage';
import AddressDetailsDialog from '../../components/wallet/receive/AddressDetailsDialog';
import successIcon from '../../assets/images/success-small.inline.svg';
import type { InjectedProps } from '../../types/injectedPropsType';

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
    const { uiNotifications, uiDialogs } = this.props.stores;
    const { wallets, addresses, hwVerifyAddress } = this.props.stores.substores.ada;
    const wallet = wallets.active;

    // Guard against potential null values
    if (!wallet) throw new Error('Active wallet required for WalletReceivePage.');

    // get info about the lattest address generated for special rendering
    const walletAddress = addresses.active ? addresses.active.id : '';
    const isWalletAddressUsed = addresses.active ? addresses.active.isUsed : false;

    /**
     * TODO: change this condition to simple
     * wallet.cwType === HARDWARE_WALLET
     * once we add support for this in Trezor also
     */
    const isHardware = wallet.hardwareInfo
      ? wallet.hardwareInfo.model === 'NanoS'
      : false;

    const walletAddresses = addresses.all.reverse();

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

    return (
      <VerticalFlexContainer>

        <NotificationMessage
          icon={successIcon}
          show={uiNotifications.isOpen(notification.id)}
        >
          {notification.message}
        </NotificationMessage>

        <WalletReceive
          walletAddress={walletAddress}
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
          onAddressDetail={({ address, path }) => {
            actions.ada.hwVerifyAddress.selectAddress.trigger({ address, path });
            this.openAddressDetailsDialog();
          }}
          isSubmitting={addresses.createAddressRequest.isExecuting}
          error={addresses.error}
        />

        {uiDialogs.isOpen(AddressDetailsDialog) && hwVerifyAddress.selectedAddress ? (
          <AddressDetailsDialog
            isActionProcessing={hwVerifyAddress.isActionProcessing}
            error={hwVerifyAddress.error}
            walletAddress={hwVerifyAddress.selectedAddress.address}
            walletPath={hwVerifyAddress.selectedAddress.path}
            isHardware={isHardware}
            verify={() => actions.ada.hwVerifyAddress.verifyAddress.trigger({ wallet })}
            cancel={() => actions.ada.hwVerifyAddress.closeAddressDetailDialog.trigger()}
          />
        ) : null}

      </VerticalFlexContainer>
    );
  }

  openAddressDetailsDialog = (): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({ dialog: AddressDetailsDialog });
  }
}
