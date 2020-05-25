// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import { intlShape } from 'react-intl';
import config from '../../config';
import WalletReceive from '../../components/wallet/WalletReceive';
import StandardHeader from '../../components/wallet/receive/StandardHeader';
import InternalHeader from '../../components/wallet/receive/InternalHeader';
import MangledHeader from '../../components/wallet/receive/MangledHeader';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import Dialog from '../../components/widgets/Dialog';
import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';
import globalMessages from '../../i18n/global-messages';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { asHasUtxoChains } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { StandardAddress, AddressStoreKind, } from '../../stores/base/AddressesStore';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import type { GeneratedData as UnmangleTxDialogContainerData } from '../transfer/UnmangleTxDialogContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

export type GeneratedData = typeof WalletReceivePage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};

@observer
export default class WalletReceivePage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = { intl: intlShape.isRequired };

  @observable notificationElementId: string = '';

  componentWillUnmount() {
    this.closeNotification();
    this.resetErrors();
  }

  handleGenerateAddress: void => Promise<void> = async () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver != null) {
      this.generated.actions.dialogs.open.trigger({
        dialog: LoadingSpinner,
      });
      await this.generated.actions.ada.addresses.createAddress.trigger(publicDeriver);
      this.generated.actions.dialogs.closeActiveDialog.trigger();
    }
  };

  resetErrors: void => void = () => {
    this.generated.actions.ada.addresses.resetErrors.trigger();
  };

  closeNotification: void => void = () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver) {
      const notificationId = `${publicDeriver.getPublicDeriverId()}-copyNotification`;
      this.generated.actions.notifications.closeActiveNotification.trigger({ id: notificationId });
    }
  };

  render(): Node {
    const { intl } = this.context;
    const actions = this.generated.actions;
    const { uiNotifications, uiDialogs, profile } = this.generated.stores;
    const {
      addresses,
      hwVerifyAddress,
      transactions
    } = this.generated.stores.substores.ada;
    const publicDeriver = this.generated.stores.wallets.selected;
    const { validateAmount } = transactions;

    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletReceivePage)}.`);

    // assume account-level wallet for now
    const withChains = asHasUtxoChains(publicDeriver);
    if (!withChains) throw new Error(`${nameof(WalletReceivePage)} only available for account-level wallets`);
    const addressTypeStore = this.getTypeStore(publicDeriver);

    if (!addressTypeStore.wasExecuted || !addressTypeStore.hasAny) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }

    // get info about the latest address generated for special rendering
    const lastAddress = addressTypeStore.last;
    const walletAddress = lastAddress != null ? lastAddress.address : '';
    const isWalletAddressUsed = lastAddress != null ? lastAddress.isUsed === true : false;

    const walletAddresses = addressTypeStore.all.slice().reverse();

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const walletType = publicDeriver.getParent().getWalletType();
    const isHwWallet = walletType === WalletTypeOption.HARDWARE_WALLET;

    const onCopyAddressTooltip = (address, elementId) => {
      if (!uiNotifications.isOpen(elementId)) {
        runInAction(() => {
          this.notificationElementId = elementId;
        });
        actions.notifications.open.trigger({
          id: elementId,
          duration: tooltipNotification.duration,
          message: tooltipNotification.message,
        });
      }
    };

    const notification = uiNotifications.getTooltipActiveNotification(
      this.notificationElementId
    );

    const addressStores = addresses.getStoresForWallet(publicDeriver);
    const { canUnmangle } = this.generated.stores.substores.ada.addresses.getUnmangleAmounts();
    const header = (() => {
      if (addressStores.some(store => store.stableName === 'external' && store.isActiveStore)) {
        return (<StandardHeader
          walletAddress={walletAddress}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          isWalletAddressUsed={isWalletAddressUsed}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          isSubmitting={addresses.createAddressRequest.isExecuting}
          error={addresses.error}
        />);
      }
      if (addressStores.some(store => store.stableName === 'internal' && store.isActiveStore)) {
        return (<InternalHeader />);
      }
      if (addressStores.some(store => store.stableName === 'mangled' && store.isActiveStore)) {
        return (
          <MangledHeader
            hasMangledUtxo={canUnmangle.length > 0}
            onClick={() => this.generated.actions.dialogs.open.trigger({
              dialog: UnmangleTxDialogContainer,
            })}
          />
        );
      }
      if (addressStores.some(store => store.stableName === 'all' && store.isActiveStore)) {
        return (<StandardHeader
          walletAddress={walletAddress}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          isWalletAddressUsed={isWalletAddressUsed}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          isSubmitting={addresses.createAddressRequest.isExecuting}
          error={addresses.error}
        />);
      }
      throw new Error(`${nameof(WalletReceivePage)} unexpected address tab`);
    })();

    return (
      <VerticalFlexContainer>
        <WalletReceive
          header={header}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          walletAddresses={walletAddresses}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          onVerifyAddress={async (request: {| address: string, path: void | BIP32Path, |}) => {
            await actions.ada.hwVerifyAddress.selectAddress.trigger(request);
            this.openVerifyAddressDialog();
          }}
          onGeneratePaymentURI={!addressStores.some(store => (
            (store.stableName === 'external' || store.stableName === 'all') && store.isActiveStore
          ))
            ? undefined
            : (address) => {
              this.openURIGenerateDialog(address);
            }
          }
        />


        {uiDialogs.isOpen(LoadingSpinner) ? (
          <Dialog
            title={intl.formatMessage(globalMessages.processingLabel)}
            closeOnOverlayClick={false}
          >
            <VerticalFlexContainer>
              <LoadingSpinner />
            </VerticalFlexContainer>
          </Dialog>
        ) : null}
        {uiDialogs.isOpen(URIGenerateDialog) ? (
          <URIGenerateDialog
            primaryTicker={this.generated.stores.profile.selectedAPI.meta.primaryTicker}
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
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={uiNotifications.getTooltipActiveNotification(
              this.notificationElementId
            )}
          />
        ) : null}

        {uiDialogs.isOpen(UnmangleTxDialogContainer) && (
          <UnmangleTxDialogContainer
            {...this.generated.UnmangleTxDialogContainerProps}
            onClose={() => this.generated.actions.dialogs.closeActiveDialog.trigger()}
          />
        )}

        {uiDialogs.isOpen(VerifyAddressDialog) && hwVerifyAddress.selectedAddress ? (
          <VerifyAddressDialog
            isActionProcessing={hwVerifyAddress.isActionProcessing}
            selectedExplorer={this.generated.stores.profile.selectedExplorer}
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

  getTypeStore: PublicDeriver<> => {
    +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
    +hasAny: boolean,
    +last: ?$ReadOnly<StandardAddress>,
    +totalAvailable: number,
    +wasExecuted: boolean,
    ...,
  } = (
    publicDeriver
  ) => {
    const { addresses } = this.generated.stores.substores.ada;
    const addressStores = addresses.getStoresForWallet(publicDeriver);

    for (const addressStore of addressStores) {
      if (addressStore.isActiveStore) {
        return addressStore;
      }
    }
    throw new Error(`${nameof(WalletReceivePage)} unexpected address tab`);
  }

  openVerifyAddressDialog: void => void = (): void => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: VerifyAddressDialog });
  }

  openURIGenerateDialog: ((address: string, amount?: number) => void) = (address, amount) => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({
      dialog: URIGenerateDialog,
      params: { address, amount }
    });
  }

  generateURI: (string, number) => void = (address, amount) => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({
      dialog: URIDisplayDialog,
      params: { address, amount }
    });
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletReceivePage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStore = stores.substores.ada;
    return Object.freeze({
      stores: {
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        profile: {
          selectedAPI: stores.profile.selectedAPI,
          selectedExplorer: stores.profile.selectedExplorer,
          isClassicTheme: stores.profile.isClassicTheme,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        substores: {
          ada: {
            addresses: {
              getUnmangleAmounts: adaStore.addresses.getUnmangleAmounts,
              getStoresForWallet: (publicDeriver: PublicDeriver<>) => {
                const substore = stores.substores.ada;
                const addressStores = substore.addresses.getStoresForWallet(publicDeriver);
                const functionalitySubset: Array<{|
                  +isActiveStore: boolean,
                  +stableName: AddressStoreKind,
                  +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
                  +hasAny: boolean,
                  +last: ?$ReadOnly<StandardAddress>,
                  +totalAvailable: number,
                  +wasExecuted: boolean,
                |}> = addressStores.map(addressStore => ({
                  isActiveStore: addressStore.isActiveStore,
                  stableName: addressStore.name.stable,
                  all: addressStore.all,
                  hasAny: addressStore.hasAny,
                  last: addressStore.last,
                  totalAvailable: addressStore.totalAvailable,
                  wasExecuted: addressStore.wasExecuted,
                }));
                return functionalitySubset;
              },
              createAddressRequest: {
                isExecuting: adaStore.addresses.createAddressRequest.isExecuting,
              },
              error: adaStore.addresses.error,
            },
            hwVerifyAddress: {
              selectedAddress: adaStore.hwVerifyAddress.selectedAddress,
              isActionProcessing: adaStore.hwVerifyAddress.isActionProcessing,
              error: adaStore.hwVerifyAddress.error,
            },
            transactions: {
              validateAmount: adaStore.transactions.validateAmount,
            },
          },
        },
      },
      actions: {
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger, },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger, },
        },
        notifications: {
          closeActiveNotification: {
            trigger: actions.notifications.closeActiveNotification.trigger,
          },
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
        ada: {
          hwVerifyAddress: {
            selectAddress: { trigger: actions.ada.hwVerifyAddress.selectAddress.trigger, },
            verifyAddress: { trigger: actions.ada.hwVerifyAddress.verifyAddress.trigger, },
            closeAddressDetailDialog: {
              trigger: actions.ada.hwVerifyAddress.closeAddressDetailDialog.trigger,
            },
          },
          addresses: {
            resetErrors: {
              trigger: actions.ada.addresses.resetErrors.trigger,
            },
            createAddress: {
              trigger: actions.ada.addresses.createAddress.trigger,
            },
          },
        },
      },
      UnmangleTxDialogContainerProps: (
        { stores, actions }: InjectedOrGenerated<UnmangleTxDialogContainerData>
      ),
    });
  }
}
