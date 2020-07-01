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
import globalMessages from '../../i18n/global-messages';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import type { AddressFilterKind, } from '../../types/AddressFilterTypes';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import type { GeneratedData as UnmangleTxDialogContainerData } from '../transfer/UnmangleTxDialogContainer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { addressGroupName, addressSubgroupName, AddressFilter, AddressSubgroup, AddressGroupTypes } from '../../types/AddressFilterTypes';
import LocalizableError from '../../i18n/LocalizableError';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { Notification } from '../../types/notificationType';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { getApiForNetwork, getApiMeta } from '../../api/common/utils';
import { isWithinSupply } from '../../utils/validations';
import { Logger, } from '../../utils/logging';
import type { AddressSubgroupMeta, IAddressTypeUiSubset, IAddressTypeStore } from '../../stores/stateless/addressStores';
import { routeForStore, allAddressSubgroups, applyAddressFilter, } from '../../stores/stateless/addressStores';
import { getUnmangleAmounts, } from '../../stores/stateless/mangledAddresses';

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
    this.generated.actions.addresses.resetFilter.trigger();
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
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletReceivePage)}.`);

    const selectedApiType = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
    const apiMeta = getApiMeta(selectedApiType)?.meta;
    if (apiMeta == null) throw new Error(`${nameof(WalletReceivePage)} no API selected`);

    const addressTypeStore = this.getTypeStore(publicDeriver);

    if (
      addressTypeStore == null ||
      !addressTypeStore.request.wasExecuted
    ) {
      return (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      );
    }

    // get info about the latest address generated for special rendering
    const lastAddress = addressTypeStore.request.all[addressTypeStore.request.all.length - 1];
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

    const selectedExplorerForNetwork = this.generated.stores.explorers.selectedExplorer
      .get(publicDeriver.getParent().getNetworkInfo().NetworkId)
      ?? (() => { throw new Error('No explorer for wallet network'); })();

    const header = (() => {
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.external) {
        return (<StandardHeader
          walletAddress={walletAddress}
          selectedExplorer={selectedExplorerForNetwork}
          isWalletAddressUsed={isWalletAddressUsed}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          isSubmitting={this.generated.stores.addresses.createAddressRequest.isExecuting}
          error={this.generated.stores.addresses.error}
          isFilterActive={this.generated.stores.addresses.addressFilter !== AddressFilter.None}
        />);
      }
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.internal) {
        return (<InternalHeader />);
      }
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.mangled) {
        return (
          <MangledHeader
            hasMangledUtxo={getUnmangleAmounts(addressTypeStore.request.all).canUnmangle.length > 0}
            onClick={() => this.generated.actions.dialogs.open.trigger({
              dialog: UnmangleTxDialogContainer,
            })}
          />
        );
      }
      if (addressTypeStore.meta.name.group === AddressGroupTypes.addressBook) {
        return null;
      }
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.all) {
        return (<StandardHeader
          walletAddress={walletAddress}
          selectedExplorer={selectedExplorerForNetwork}
          isWalletAddressUsed={isWalletAddressUsed}
          onGenerateAddress={this.handleGenerateAddress}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          isSubmitting={this.generated.stores.addresses.createAddressRequest.isExecuting}
          error={this.generated.stores.addresses.error}
          isFilterActive={this.generated.stores.addresses.addressFilter !== AddressFilter.None}
        />);
      }
      throw new Error(`${nameof(WalletReceivePage)} unexpected address tab`);
    })();

    const getSelectedHierarchyPath = () => {
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.all) {
        return [
          intl.formatMessage(addressGroupName[addressTypeStore.meta.name.group]),
        ];
      }

      return [
        intl.formatMessage(addressGroupName[addressTypeStore.meta.name.group]),
        intl.formatMessage(addressSubgroupName[addressTypeStore.meta.name.subgroup])
      ];
    };
    return (
      <VerticalFlexContainer>
        <WalletReceive
          hierarchy={{
            path: getSelectedHierarchyPath(),
            filter: this.generated.stores.addresses.addressFilter,
          }}
          header={header}
          selectedExplorer={selectedExplorerForNetwork}
          walletAddresses={applyAddressFilter({
            addressFilter: this.generated.stores.addresses.addressFilter,
            addresses: addressTypeStore.request.all,
          }).slice().reverse()}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          onVerifyAddress={async (request: {| address: string, path: void | BIP32Path, |}) => {
            await actions.ada.hwVerifyAddress.selectAddress.trigger(request);
            this.openVerifyAddressDialog();
          }}
          onGeneratePaymentURI={
            (
              addressTypeStore.meta.name.subgroup !== AddressSubgroup.external &&
              addressTypeStore.meta.name.subgroup !== AddressSubgroup.all
            )
              ? undefined
              : (address) => {
                this.openURIGenerateDialog(address);
              }
        }
          shouldHideBalance={profile.shouldHideBalance}
          unitOfAccountSetting={profile.unitOfAccount}
          meta={{
            primaryTicker: apiMeta.primaryTicker,
            decimalPlaces: apiMeta.decimalPlaces.toNumber(),
          }}
          addressBook={addressTypeStore.meta.name.group === AddressGroupTypes.addressBook}
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
            primaryTicker={apiMeta.primaryTicker}
            walletAddress={uiDialogs.getParam<string>('address')}
            amount={uiDialogs.getParam<number>('amount')}
            onClose={() => actions.dialogs.closeActiveDialog.trigger()}
            onGenerate={(address, amount) => { this.generateURI(address, amount); }}
            classicTheme={profile.isClassicTheme}
            currencyMaxIntegerDigits={
              apiMeta.totalSupply.div(apiMeta.decimalPlaces).toFixed().length
            }
            currencyMaxFractionalDigits={apiMeta.decimalPlaces.toNumber()}
            validateAmount={(amount) => Promise.resolve(
              isWithinSupply(amount, apiMeta.totalSupply)
            )}
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
            selectedExplorer={selectedExplorerForNetwork}
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

  getTypeStore: PublicDeriver<> => void | {|
    +request: IAddressTypeUiSubset,
    +meta: AddressSubgroupMeta<IAddressTypeStore>,
  |} = (publicDeriver) => {
    for (const addressStore of allAddressSubgroups) {
      if (!addressStore.isRelated({ selected: publicDeriver })) {
        continue;
      }
      if (this.generated.stores.app.currentRoute.startsWith(
        routeForStore(addressStore.name)
      )) {
        const request = this.generated.stores.addresses.addressSubgroupMap.get(addressStore.class);
        if (request == null) throw new Error('Should never happen');
        return {
          request,
          meta: addressStore,
        };
      }
    }
    Logger.error(`${nameof(WalletReceivePage)} unexpected address tab`);
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
      app: {| currentRoute: string |},
      addresses: {|
        addressFilter: AddressFilterKind,
        createAddressRequest: {| isExecuting: boolean |},
        error: ?LocalizableError,
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        shouldHideBalance: boolean,
        unitOfAccount: UnitOfAccountSettingType,
      |},
      substores: {|
        ada: {|
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
        app: {
          currentRoute: stores.app.currentRoute,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          shouldHideBalance: stores.profile.shouldHideBalance,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        addresses: {
          addressFilter: stores.addresses.addressFilter,
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
          createAddressRequest: {
            isExecuting: stores.addresses.createAddressRequest.isExecuting,
          },
          error: stores.addresses.error,
        },
        substores: {
          ada: {
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
