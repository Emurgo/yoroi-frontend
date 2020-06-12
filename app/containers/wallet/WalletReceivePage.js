// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';
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
import type { AddressFilterKind, StandardAddress, AddressStoreKind, } from '../../types/AddressFilterTypes';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import type { GeneratedData as UnmangleTxDialogContainerData } from '../transfer/UnmangleTxDialogContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type { SelectedApiType } from '../../stores/toplevel/ProfileStore';
import { AddressStoreTypes } from '../../types/AddressFilterTypes';
import LocalizableError from '../../i18n/LocalizableError';
import type { ExplorerType } from '../../domain/Explorer';
import type { Notification } from '../../types/notificationType';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

export type GeneratedData = typeof WalletReceivePage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  addressBook: boolean
|};



// TO REMOVE - DATA FOR ADDRESS BOOK
const addressBookStores = {
  isActiveStore: true,
  stableName: 'AddressBook',
  all: [
    {
      address: 'Ae2tdPwUPEZJ9HwF8zATdjWcbMTpWAMSMLMxpzdwxiou6evpT57cixBaVyh',
      label: undefined,
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          0
        ],
        startLevel: 1
      },
      isUsed: true,
      value: undefined
    },
    {
      address: 'Ae2tdPwUPEZ76BjmWDTS7poTekAvNqBjgfthF92pSLSDVpRVnLP7meaFhVd',
      label: 'TO RECEIVE PAYMENT FROM A AND B',
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          1
        ],
        startLevel: 1
      },
      isUsed: true,
      value: undefined
    },
    {
      address: 'Ae2tdPwUPEZ9MXvDp7cWRPEZLNkpvP7t5zcVQfRsz2vVqWR74GTZGX3JoxN',
      label: undefined,
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          2
        ],
        startLevel: 1
      },
      isUsed: true,
      value: undefined
    },
    {
      address: 'Ae2tdPwUPEZ51dzqqzbgwWLYidHFEEsougKw7U7956QoACCU6zTybYrBMk2',
      label: 'TO RECEIVE PAYMENT FROM X AND Y',
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          3
        ],
        startLevel: 1
      },
      isUsed: false,
      value: undefined
    },
    {
      address: 'Ae2tdPwUPEZ1SSYES4uTcNe2fVszQ9ECsWG8otkmfedn983rNmEGj6dUvh9',
      label: 'TO RECEIVE PAYMENT FROM X AND Y',
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          9
        ],
        startLevel: 1
      },
      isUsed: false,
      value: undefined
    },
    {
      address: 'Ae2tdPwUPEZJGKfqajPqZv4HT26JGw6SDhXaQSLeTfAa2pTEQfz9g2FRPy6',
      label: 'TO RECEIVE PAYMENT FROM X AND Y',
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          10
        ],
        startLevel: 1
      },
      isUsed: false,
      value: undefined
    },
    {
      address: 'Ae2tdPwUPEZH8ZcK1FXoJNm2wYjU3LbDjU7BRJmC3AgiSLMSmsXjqvMnTdc',
      label: undefined,
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          11
        ],
        startLevel: 1
      },
      isUsed: true,
    },
    {
      address: 'Ae2tdPwUPEZGzg1QAxkzXAWpobgPnrKurmquSCx78R78v22nb8MSgewXUfH',
      label: 'TO RECEIVE PAYMENT FROM X AND Y',
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          12
        ],
        startLevel: 1
      },
      isUsed: false,
      value: undefined
    },
    {
      address: 'Ae2tdPwUPEZ5VVzEBgbnETGkhfgDbenRDvREoTtNDQzoWdyr46bNGCi84R6',
      label: undefined,
      addressing: {
        path: [
          2147483692,
          2147485463,
          2147483648,
          0,
          13
        ],
        startLevel: 1
      },
      isUsed: false,
      value: undefined
    },
  ],
  filtered: [],
  wasExecuted: true
};

@observer
export default class WalletReceivePage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = { intl: intlShape.isRequired };

  @observable notificationElementId: string = '';

  componentWillUnmount() {
    this.closeNotification();
    this.resetErrors();
    this.generated.actions.addresses.resetFilter.trigger();
  }

  getSelectedApi: void => SelectedApiType = () => {
    const { selectedAPI } = this.generated.stores.profile;
    if (selectedAPI === undefined) {
      throw new Error(`${nameof(WalletReceivePage)} no API selected`);
    }
    return selectedAPI;
  }

  handleGenerateAddress: void => Promise<void> = async () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver != null) {
      this.generated.actions.dialogs.open.trigger({
        dialog: LoadingSpinner,
      });
      await this.generated.actions.addresses.createAddress.trigger(publicDeriver);
      this.generated.actions.dialogs.closeActiveDialog.trigger();
    }
  };

  resetErrors: void => void = () => {
    this.generated.actions.addresses.resetErrors.trigger();
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
      hwVerifyAddress,
    } = this.generated.stores.substores.ada;
    const publicDeriver = this.generated.stores.wallets.selected;
    const { validateAmount } = this.generated.stores.transactions;
    const selectedAPI = this.getSelectedApi();

    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletReceivePage)}.`);

    // assume account-level wallet for now
    const withChains = asHasUtxoChains(publicDeriver);
    if (!withChains) throw new Error(`${nameof(WalletReceivePage)} only available for account-level wallets`);
    const addressTypeStore = this.getTypeStore(publicDeriver);

    if (!addressTypeStore.wasExecuted || addressTypeStore.all.length === 0) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }

    // get info about the latest address generated for special rendering
    const lastAddress = addressTypeStore.all[addressTypeStore.all.length - 1];
    const walletAddress = lastAddress != null ? lastAddress.address : '';
    const isWalletAddressUsed = lastAddress != null ? lastAddress.isUsed === true : false;

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

    const addressStores = this.generated.stores.addresses.getStoresForWallet(publicDeriver);
    const { canUnmangle } = this.generated.stores.substores.ada.addresses.getUnmangleAmounts();
    const header = (() => {
      if (addressStores.some(store => (
        store.stableName === AddressStoreTypes.external && store.isActiveStore
      ))) {
        return (<StandardHeader
          walletAddress={walletAddress}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          isWalletAddressUsed={isWalletAddressUsed}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          isSubmitting={this.generated.stores.addresses.createAddressRequest.isExecuting}
          error={this.generated.stores.addresses.error}
        />);
      }
      if (addressStores.some(store => (
        store.stableName === AddressStoreTypes.internal && store.isActiveStore
      ))) {
        return (<InternalHeader />);
      }
      if (addressStores.some(store => (
        store.stableName === AddressStoreTypes.mangled && store.isActiveStore
      ))) {
        return (
          <MangledHeader
            hasMangledUtxo={canUnmangle.length > 0}
            onClick={() => this.generated.actions.dialogs.open.trigger({
              dialog: UnmangleTxDialogContainer,
            })}
          />
        );
      }
      if (addressStores.some(store => (
        store.stableName === AddressStoreTypes.all && store.isActiveStore
      ))) {
        return (<StandardHeader
          walletAddress={walletAddress}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          isWalletAddressUsed={isWalletAddressUsed}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          isSubmitting={this.generated.stores.addresses.createAddressRequest.isExecuting}
          error={this.generated.stores.addresses.error}
        />);
      }
      if (this.props.addressBook) { // TO REMOVE FOR ADDRESS BOOK
        return null;
      }
      throw new Error(`${nameof(WalletReceivePage)} unexpected address tab`);
    })();

    return (
      <VerticalFlexContainer>
       
        {/* FOR ADDRESS BOOK */}
        {
          this.props.addressBook ?
            <WalletReceive
              header={header}
              selectedExplorer={this.generated.stores.profile.selectedExplorer}
              walletAddresses={addressBookStores.all}
              addressBook={this.props.addressBook} // TO REMOVE
              onCopyAddressTooltip={onCopyAddressTooltip}
              notification={notification}
              onVerifyAddress={async (request: {| address: string, path: void | BIP32Path, |}) => {
                await actions.ada.hwVerifyAddress.selectAddress.trigger(request);
                this.openVerifyAddressDialog();
              }}
              onGeneratePaymentURI={undefined}
              shouldHideBalance={profile.shouldHideBalance}
              unitOfAccountSetting={profile.unitOfAccount}
            />
            :
            <WalletReceive
              header={header}
              selectedExplorer={this.generated.stores.profile.selectedExplorer}
              walletAddresses={addressTypeStore.filtered.slice().reverse()}
              onCopyAddressTooltip={onCopyAddressTooltip}
              notification={notification}
              onVerifyAddress={async (request: {| address: string, path: void | BIP32Path, |}) => {
                await actions.ada.hwVerifyAddress.selectAddress.trigger(request);
                this.openVerifyAddressDialog();
              }}
              onGeneratePaymentURI={!addressStores.some(store => (
                (
                  store.stableName === AddressStoreTypes.external ||
                  store.stableName === AddressStoreTypes.all
                ) &&
                store.isActiveStore
              ))
                ? undefined
                : (address) => {
                  this.openURIGenerateDialog(address);
                }
            }
              shouldHideBalance={profile.shouldHideBalance}
              unitOfAccountSetting={profile.unitOfAccount}
            />
        }


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
            primaryTicker={selectedAPI.meta.primaryTicker}
            walletAddress={uiDialogs.getParam<string>('address')}
            amount={uiDialogs.getParam<number>('amount')}
            onClose={() => actions.dialogs.closeActiveDialog.trigger()}
            onGenerate={(address, amount) => { this.generateURI(address, amount); }}
            classicTheme={profile.isClassicTheme}
            currencyMaxIntegerDigits={MAX_INTEGER_PLACES_IN_ADA}
            currencyMaxFractionalDigits={DECIMAL_PLACES_IN_ADA}
            validateAmount={(amount) => validateAmount({ publicDeriver, amount })}
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
    +filtered: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
    +wasExecuted: boolean,
    ...,
  } = (
    publicDeriver
  ) => {
    const addressStores = this.generated.stores.addresses.getStoresForWallet(publicDeriver);
    // TO REMOVE FOR ADDRESS BOOK
    if (this.props.addressBook) {
      return addressBookStores;
    }

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

  @computed get generated(): {|
    UnmangleTxDialogContainerProps: InjectedOrGenerated<UnmangleTxDialogContainerData>,
    actions: {|
      ada: {|
        hwVerifyAddress: {|
          closeAddressDetailDialog: {|
            trigger: (params: void) => void
          |},
          selectAddress: {|
            trigger: (params: {|
              address: string,
              path: void | BIP32Path
            |}) => Promise<void>
          |},
          verifyAddress: {|
            trigger: (
              params: PublicDeriver<>
            ) => Promise<void>
          |}
        |}
      |},
      addresses: {|
        createAddress: {|
          trigger: (params: PublicDeriver<>) => Promise<void>
        |},
        resetErrors: {| trigger: (params: void) => void |},
        resetFilter: {| trigger: (params: void) => void |},
        setFilter: {|
          trigger: (params: AddressFilterKind) => void
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |}
      |},
      notifications: {|
        closeActiveNotification: {|
          trigger: (params: {| id: string |}) => void
        |},
        open: {| trigger: (params: Notification) => void |}
      |}
    |},
    stores: {|
      addresses: {|
        addressFilter: AddressFilterKind,
        createAddressRequest: {| isExecuting: boolean |},
        error: ?LocalizableError,
        getStoresForWallet: (
          publicDeriver: PublicDeriver<>
        ) => Array<{|
          +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
          +filtered: $ReadOnlyArray<
            $ReadOnly<StandardAddress>
          >,
          +isActiveStore: boolean,
          +stableName: AddressStoreKind,
          +wasExecuted: boolean
        |}>
      |},
      profile: {|
        isClassicTheme: boolean,
        selectedAPI: void | SelectedApiType,
        selectedExplorer: ExplorerType,
        shouldHideBalance: boolean,
        unitOfAccount: UnitOfAccountSettingType,
      |},
      substores: {|
        ada: {|
          addresses: {|
            getUnmangleAmounts: void => {|
              canUnmangle: Array<BigNumber>,
              cannotUnmangle: Array<BigNumber>
            |}
          |},
          hwVerifyAddress: {|
            error: ?LocalizableError,
            isActionProcessing: boolean,
            selectedAddress: ?{|
              address: string,
              path: void | BIP32Path
            |}
          |}
        |}
      |},
      transactions: {|
        validateAmount: ({|
          amount: string,
          publicDeriver: PublicDeriver<>
        |}) => Promise<boolean>
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean
      |},
      wallets: {| selected: null | PublicDeriver<> |}
    |}
    |} {
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
          shouldHideBalance: stores.profile.shouldHideBalance,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        transactions: {
          validateAmount: stores.transactions.validateAmount,
        },
        addresses: {
          addressFilter: stores.addresses.addressFilter,
          getStoresForWallet: (publicDeriver: PublicDeriver<>) => {
            const addressStores = stores.addresses.getStoresForWallet(publicDeriver);
            const functionalitySubset: Array<{|
              +isActiveStore: boolean,
              +stableName: AddressStoreKind,
              +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
              +filtered: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
              +wasExecuted: boolean,
            |}> = addressStores.map(addressStore => ({
              isActiveStore: addressStore.isActiveStore,
              stableName: addressStore.name.stable,
              all: addressStore.all,
              filtered: addressStore.filtered,
              wasExecuted: addressStore.wasExecuted,
            }));
            return functionalitySubset;
          },
          createAddressRequest: {
            isExecuting: stores.addresses.createAddressRequest.isExecuting,
          },
          error: stores.addresses.error,
        },
        substores: {
          ada: {
            addresses: {
              getUnmangleAmounts: adaStore.addresses.getUnmangleAmounts,
            },
            hwVerifyAddress: {
              selectedAddress: adaStore.hwVerifyAddress.selectedAddress,
              isActionProcessing: adaStore.hwVerifyAddress.isActionProcessing,
              error: adaStore.hwVerifyAddress.error,
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
        addresses: {
          setFilter: { trigger: actions.addresses.setFilter.trigger, },
          resetFilter: { trigger: actions.addresses.resetFilter.trigger, },
          resetErrors: {
            trigger: actions.addresses.resetErrors.trigger,
          },
          createAddress: {
            trigger: actions.addresses.createAddress.trigger,
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
        },
      },
      UnmangleTxDialogContainerProps: (
        { stores, actions }: InjectedOrGenerated<UnmangleTxDialogContainerData>
      ),
    });
  }
}
