// @flow
import React, { Component } from 'react';
import { defineMessages, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { ellipsis } from '../../utils/strings';
import config from '../../config';
import WalletReceive from '../../components/wallet/WalletReceive';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import NotificationMessage from '../../components/widgets/NotificationMessage';
import successIcon from '../../assets/images/success-small.inline.svg';
import type { InjectedProps } from '../../types/injectedPropsType';

export const messages = defineMessages({
  message: {
    id: 'wallet.receive.page.addressCopyNotificationMessage',
    defaultMessage: '!!!You have successfully copied wallet address',
    description: 'Message for the wallet address copy success notification.',
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
    const { uiNotifications, theme } = this.props.stores;
    const { wallets, addresses } = this.props.stores.substores.ada;
    const wallet = wallets.active;

    // Guard against potential null values
    if (!wallet) throw new Error('Active wallet required for WalletReceivePage.');

    const walletAddress = addresses.active ? addresses.active.id : '';
    const isWalletAddressUsed = addresses.active ? addresses.active.isUsed : false;
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
    const notificationComponent = (
      <NotificationMessage
        icon={successIcon}
        show={uiNotifications.isOpen(notification.id)}
      >
        {notification.message}
      </NotificationMessage>
    );

    return (
      <VerticalFlexContainer>

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
            });
          }}
          isSubmitting={addresses.createAddressRequest.isExecuting}
          error={addresses.error}
          oldTheme={theme.old}
          notification={notificationComponent}
        />

        {theme.old && notificationComponent}

      </VerticalFlexContainer>
    );
  }
}
