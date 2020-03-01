// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import config from '../../config';
import WalletReceive from '../../components/wallet/WalletReceive';
import StandardHeader from '../../components/wallet/receive/StandardHeader';
import InternalHeader from '../../components/wallet/receive/InternalHeader';
import MangledHeader from '../../components/wallet/receive/MangledHeader';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import type { InjectedProps } from '../../types/injectedPropsType';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';
import globalMessages from '../../i18n/global-messages';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { asHasUtxoChains } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { StandardAddress, AddressTypeStore } from '../../stores/base/AddressesStore';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';

type Props = {|
  ...InjectedProps,
|};

type State = {|
  notificationElementId: string,
|};

@observer
export default class WalletReceivePage extends Component<Props, State> {

  state = {
    notificationElementId: ''
  };

  componentWillUnmount() {
    this.closeNotification();
    this.resetErrors();
  }

  handleGenerateAddress: void => Promise<void> = async () => {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver != null) {
      await this.props.actions.ada.addresses.createAddress.trigger(publicDeriver);
    }
  };

  resetErrors = () => {
    this.props.actions.ada.addresses.resetErrors.trigger();
  };

  closeNotification = () => {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver) {
      const notificationId = `${publicDeriver.getPublicDeriverId()}-copyNotification`;
      this.props.actions.notifications.closeActiveNotification.trigger({ id: notificationId });
    }
  };

  render() {
    const actions = this.props.actions;
    const { uiNotifications, uiDialogs, profile } = this.props.stores;
    const {
      addresses,
      hwVerifyAddress,
      transactions
    } = this.props.stores.substores.ada;
    const publicDeriver = this.props.stores.wallets.selected;
    const { validateAmount } = transactions;

    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletReceivePage)}.`);

    // assume account-level wallet for now
    const withChains = asHasUtxoChains(publicDeriver);
    if (!withChains) throw new Error(`${nameof(WalletReceivePage)} only available for account-level wallets`);
    const addressTypeStore = this.getTypeStore(publicDeriver);

    if (!addressTypeStore.getRequest(publicDeriver).wasExecuted || !addressTypeStore.hasAny) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }

    // get info about the latest address generated for special rendering
    const lastAddress = addressTypeStore.last;
    const walletAddress = lastAddress != null ? lastAddress.address : '';
    const isWalletAddressUsed = lastAddress != null ? lastAddress.isUsed : false;

    const walletAddresses = addressTypeStore.all.slice().reverse();

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const walletType = publicDeriver.getParent().getWalletType();
    const isHwWallet = walletType === WalletTypeOption.HARDWARE_WALLET;

    const onCopyAddressTooltip = (address, elementId) => {
      if (!uiNotifications.isOpen(elementId)) {
        this.setState({ notificationElementId: elementId });
        actions.notifications.open.trigger({
          id: elementId,
          duration: tooltipNotification.duration,
          message: tooltipNotification.message,
        });
      }
    };

    const notification = uiNotifications.getTooltipActiveNotification(
      this.state.notificationElementId
    );

    const { canUnmangle } = this.props.stores.substores.ada.addresses.getUnmangleAmounts();
    const header = (() => {
      if (addresses.isActiveTab('external', publicDeriver)) {
        return (<StandardHeader
          walletAddress={walletAddress}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
          isWalletAddressUsed={isWalletAddressUsed}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          isSubmitting={addresses.createAddressRequest.isExecuting}
          error={addresses.error}
        />);
      }
      if (addresses.isActiveTab('internal', publicDeriver)) {
        return (<InternalHeader />);
      }
      if (addresses.isActiveTab('mangled', publicDeriver)) {
        return (
          <MangledHeader
            hasMangledUtxo={canUnmangle.length > 0}
            onClick={() => this.props.actions.dialogs.open.trigger({
              dialog: UnmangleTxDialogContainer,
            })}
          />
        );
      }
      throw new Error(`${nameof(WalletReceivePage)} unexpected address tab`);
    })();

    return (
      <VerticalFlexContainer>
        <WalletReceive
          header={header}
          selectedExplorer={this.props.stores.profile.selectedExplorer}
          walletAddresses={walletAddresses}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          onVerifyAddress={async ({ address, path }) => {
            await actions.ada.hwVerifyAddress.selectAddress.trigger({ address, path });
            this.openVerifyAddressDialog();
          }}
          onGeneratePaymentURI={!addresses.isActiveTab('external', publicDeriver)
            ? undefined
            : (address) => {
              this.openURIGenerateDialog(address);
            }
          }
        />

        {uiDialogs.isOpen(URIGenerateDialog) ? (
          <URIGenerateDialog
            walletAddress={uiDialogs.getParam<string>('address')}
            amount={uiDialogs.getParam<number>('amount')}
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
            address={uiDialogs.getParam<string>('address')}
            amount={uiDialogs.getParam<number>('amount')}
            onClose={actions.dialogs.closeActiveDialog.trigger}
            onBack={() => this.openURIGenerateDialog(
              uiDialogs.getParam<string>('address'),
              uiDialogs.getParam<number>('amount'),
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
            notification={uiNotifications.getTooltipActiveNotification(
              this.state.notificationElementId
            )}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(UnmangleTxDialogContainer) && (
          <UnmangleTxDialogContainer
            actions={this.props.actions}
            stores={this.props.stores}
            onClose={() => this.props.actions.dialogs.closeActiveDialog.trigger()}
          />
        )}

        {uiDialogs.isOpen(VerifyAddressDialog) && hwVerifyAddress.selectedAddress ? (
          <VerifyAddressDialog
            isActionProcessing={hwVerifyAddress.isActionProcessing}
            selectedExplorer={this.props.stores.profile.selectedExplorer}
            error={hwVerifyAddress.error}
            walletAddress={hwVerifyAddress.selectedAddress.address}
            walletPath={hwVerifyAddress.selectedAddress.path}
            isHardware={isHwWallet}
            verify={() => actions.ada.hwVerifyAddress.verifyAddress.trigger(publicDeriver)}
            cancel={actions.ada.hwVerifyAddress.closeAddressDetailDialog.trigger}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

      </VerticalFlexContainer>
    );
  }

  getTypeStore: PublicDeriver<> => AddressTypeStore<StandardAddress> = (
    publicDeriver
  ) => {
    const { addresses } = this.props.stores.substores.ada;
    if (addresses.isActiveTab('external', publicDeriver)) {
      return addresses.externalForDisplay;
    }
    if (addresses.isActiveTab('internal', publicDeriver)) {
      return addresses.internalForDisplay;
    }
    if (addresses.isActiveTab('mangled', publicDeriver)) {
      return addresses.mangledAddressesForDisplay;
    }
    throw new Error(`${nameof(WalletReceivePage)} unexpected address tab`);
  }

  openVerifyAddressDialog: void => void = (): void => {
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

  generateURI: (string, number) => void = (address, amount) => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({
      dialog: URIDisplayDialog,
      params: { address, amount }
    });
  }
}
