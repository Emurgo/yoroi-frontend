// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import config from '../../config';
import WalletReceive from '../../components/wallet/WalletReceive';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import type { InjectedProps } from '../../types/injectedPropsType';

import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';
import globalMessages from '../../i18n/global-messages';
import type {
  StandardAddress,
  AddressTypeStore,
} from '../../stores/base/AddressesStore';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';


type Props = {
  ...InjectedProps,
  addressTypeStore: AddressTypeStore<StandardAddress>,
};

type State = {
  notificationElementId: string,
};

@observer
export default class WalletReceivePage extends Component<Props, State> {

  state = {
    notificationElementId: ''
  };

  componentWillUnmount() {
    this.closeNotification();
    this.resetErrors();
  }

  handleGenerateAddress = () => {
    const { wallets } = this.props.stores.substores.ada;
    const publicDeriver = wallets.selected;
    if (publicDeriver != null) {
      this.props.actions.ada.addresses.createAddress.trigger();
    }
  };

  resetErrors = () => {
    this.props.actions.ada.addresses.resetErrors.trigger();
  };

  closeNotification = () => {
    const { wallets } = this.props.stores.substores.ada;
    const publicDeriver = wallets.selected;
    if (publicDeriver) {
      const notificationId = `${publicDeriver.self.getPublicDeriverId()}-copyNotification`;
      this.props.actions.notifications.closeActiveNotification.trigger({ id: notificationId });
    }
  };

  render() {
    const actions = this.props.actions;
    const { uiNotifications, uiDialogs, profile } = this.props.stores;
    const {
      wallets,
      addresses,
      hwVerifyAddress,
      transactions
    } = this.props.stores.substores.ada;
    const publicDeriver = wallets.selected;
    const { validateAmount } = transactions;

    // Guard against potential null values
    if (!publicDeriver) throw new Error('Active wallet required for WalletReceivePage.');

    // get info about the lattest address generated for special rendering
    const lastAddress = this.props.addressTypeStore.last;
    const walletAddress = lastAddress != null ? lastAddress.address : '';
    const isWalletAddressUsed = lastAddress != null ? lastAddress.isUsed : false;

    const walletAddresses = this.props.addressTypeStore.all.slice().reverse();

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const walletType = publicDeriver.self.getConceptualWallet().getWalletType();
    const isHwWallet = walletType === WalletTypeOption.HARDWARE_WALLET;

    return (
      <VerticalFlexContainer>
        <WalletReceive
          walletAddress={walletAddress}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
          isWalletAddressUsed={isWalletAddressUsed}
          walletAddresses={walletAddresses}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={(address, elementId) => {
            if (!uiNotifications.isOpen(elementId)) {
              this.setState({ notificationElementId: elementId });
              actions.notifications.open.trigger({
                id: elementId,
                duration: tooltipNotification.duration,
                message: tooltipNotification.message,
              });
            }
          }}
          getNotification={uiNotifications.getTooltipActiveNotification(
            this.state.notificationElementId
          )}
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
            onCopyAddressTooltip={(elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                this.setState({ notificationElementId: elementId });
                actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            getNotification={uiNotifications.getTooltipActiveNotification(
              this.state.notificationElementId
            )}
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
            isHardware={isHwWallet}
            verify={() => actions.ada.hwVerifyAddress.verifyAddress.trigger(publicDeriver.self)}
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
