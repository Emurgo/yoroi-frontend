// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { StandardAddress } from '../../types/AddressFilterTypes';
import {
  AddressFilter,
  addressGroupName,
  AddressGroupTypes,
  AddressSubgroup,
  addressSubgroupName,
} from '../../types/AddressFilterTypes';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type {
  AddressSubgroupMeta,
  IAddressTypeStore,
  IAddressTypeUiSubset,
} from '../../stores/stateless/addressStores';
import { allAddressSubgroups, applyAddressFilter, routeForStore, } from '../../stores/stateless/addressStores';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import { validateAmount } from '../../utils/validations';
import { Logger } from '../../utils/logging';
import { handleExternalLinkClick } from '../../utils/routing';
import { genLookupOrFail, getTokenName } from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import BigNumber from 'bignumber.js';
import config from '../../config';
import InternalHeader from '../../components/wallet/receive/InternalHeader';
import RewardHeader from '../../components/wallet/receive/RewardHeader';
import MangledHeader from '../../components/wallet/receive/MangledHeader';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import VerifyAddressDialog from '../../components/wallet/receive/VerifyAddressDialog';
import URIGenerateDialog from '../../components/uri/URIGenerateDialog';
import URIDisplayDialog from '../../components/uri/URIDisplayDialog';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import Dialog from '../../components/widgets/Dialog';
import globalMessages from '../../i18n/global-messages';
import WalletReceiveRevamp from '../../components/wallet/WalletReceiveRevamp';
import UnmangleTxDialogContainer from '../transfer/UnmangleTxDialogContainer';
import StandardHeaderRevamp from '../../components/wallet/receive/StandardHeaderRevamp';
import { maybe } from '../../coreUtils';
import type { StoresProps } from '../../stores';

@observer
export default class WalletReceivePage extends Component<StoresProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  @observable notificationElementId: string = '';

  componentWillUnmount() {
    this.closeNotification();
    this.resetErrors();
    this.props.stores.addresses.resetFilter();
  }

  handleGenerateAddress: void => Promise<void> = async () => {
    const { stores } = this.props;
    const publicDeriver = stores.wallets.selected;
    if (publicDeriver != null) {
      // <TODO:IMPROVE> there's gotta be a better way to render loading while waiting for a request result
      this.props.stores.uiDialogs.open({
        dialog: LoadingSpinner,
      });
      await stores.addresses.createAddress(publicDeriver);
      this.props.stores.uiDialogs.closeActiveDialog();
    }
  };

  resetErrors: void => void = () => {
    this.props.stores.addresses.resetErrors();
  };

  closeNotification: void => void = () => {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver) {
      const notificationId = `${publicDeriver.publicDeriverId}-copyNotification`;
      this.props.stores.uiNotifications.closeActiveNotification({ id: notificationId });
    }
  };

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.props;
    const { uiNotifications, uiDialogs, profile } = this.props.stores;
    const { hwVerifyAddress } = this.props.stores.substores.ada;
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletReceivePage)}.`);

    const addressTypeStore = this.getTypeStore(publicDeriver);

    if (addressTypeStore == null || !addressTypeStore.request.wasExecuted) {
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

    const isHwWallet = publicDeriver.type !== 'mnemonic';

    const onCopyAddressTooltip = (address, elementId) => {
      if (!uiNotifications.isOpen(elementId)) {
        runInAction(() => {
          this.notificationElementId = elementId;
        });
        uiNotifications.open({
          id: elementId,
          duration: tooltipNotification.duration,
          message: tooltipNotification.message,
        });
      }
    };

    const notification = uiNotifications.getTooltipActiveNotification(this.notificationElementId);

    const selectedExplorerForNetwork =
      stores.explorers.selectedExplorer.get(
        publicDeriver.networkId
      ) ??
      (() => {
        throw new Error('No explorer for wallet network');
      })();

    const defaultToken = {
      defaultNetworkId: publicDeriver.networkId,
      defaultIdentifier: publicDeriver.defaultTokenId,
    };
    const defaultTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo)({
      identifier: defaultToken.defaultIdentifier,
      networkId: defaultToken.defaultNetworkId,
    });

    const header = (() => {

      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.external) {
        return (
          <StandardHeaderRevamp
            walletAddress={walletAddress}
            selectedExplorer={selectedExplorerForNetwork}
            isWalletAddressUsed={isWalletAddressUsed}
            onGenerateAddress={this.handleGenerateAddress}
            onCopyAddressTooltip={onCopyAddressTooltip}
            notification={notification}
            isSubmitting={stores.addresses.createAddressRequest.isExecuting}
            error={stores.addresses.error}
            isFilterActive={stores.addresses.addressFilter !== AddressFilter.None}
          />
        );
      }
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.internal) {
        return <InternalHeader onExternalLinkClick={handleExternalLinkClick} />;
      }
      if (addressTypeStore.meta.name.group === AddressGroupTypes.reward) {
        return <RewardHeader ticker={truncateToken(getTokenName(defaultTokenInfo))} />;
      }
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.mangled) {

        const canUnmangle = maybe(stores.wallets.selected,
          w => stores.delegation.canUnmangleSomeUtxo(w.publicDeriverId)) ?? false;

        return (
          <MangledHeader
            hasMangledUtxo={canUnmangle}
            onClick={() =>
              this.props.stores.uiDialogs.open({
                dialog: UnmangleTxDialogContainer,
              })
            }
            ticker={truncateToken(getTokenName(defaultTokenInfo))}
          />
        );
      }
      if (addressTypeStore.meta.name.group === AddressGroupTypes.addressBook) {
        return null;
      }
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.all) {
        return (
          <StandardHeaderRevamp
            walletAddress={walletAddress}
            selectedExplorer={selectedExplorerForNetwork}
            isWalletAddressUsed={isWalletAddressUsed}
            onGenerateAddress={this.handleGenerateAddress}
            onCopyAddressTooltip={onCopyAddressTooltip}
            notification={notification}
            isSubmitting={stores.addresses.createAddressRequest.isExecuting}
            error={stores.addresses.error}
            isFilterActive={stores.addresses.addressFilter !== AddressFilter.None}
          />
        );
      }
      throw new Error(`${nameof(WalletReceivePage)} unexpected address tab`);
    })();

    const getSelectedHierarchyPath = () => {
      if (addressTypeStore.meta.name.subgroup === AddressSubgroup.all) {
        return [intl.formatMessage(addressGroupName[addressTypeStore.meta.name.group])];
      }

      return [
        intl.formatMessage(addressGroupName[addressTypeStore.meta.name.group]),
        intl.formatMessage(addressSubgroupName[addressTypeStore.meta.name.subgroup]),
      ];
    };

    const paramAddress = uiDialogs.getParam<string>('address') ?? '';
    const paramAmount = uiDialogs.getParam<?string>('amount') ?? '0';

    return (
      <VerticalFlexContainer>
        <WalletReceiveRevamp
          hierarchy={{
            path: getSelectedHierarchyPath(),
            filter: stores.addresses.addressFilter,
          }}
          header={header}
          getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
          selectedExplorer={selectedExplorerForNetwork}
          walletAddresses={applyAddressFilter({
            addressFilter: stores.addresses.addressFilter,
            addresses: addressTypeStore.request.all,
          })
            .slice()
            .reverse()}
          onCopyAddressTooltip={onCopyAddressTooltip}
          notification={notification}
          onVerifyAddress={async (request: $ReadOnly<StandardAddress>) => {
            await stores.substores.ada.hwVerifyAddress.selectAddress(request);
            this.openVerifyAddressDialog();
          }}
          onGeneratePaymentURI={
            addressTypeStore.meta.name.group === AddressGroupTypes.reward ||
            (addressTypeStore.meta.name.subgroup !== AddressSubgroup.external &&
              addressTypeStore.meta.name.subgroup !== AddressSubgroup.all)
              ? undefined
              : address => {
                  this.openURIGenerateDialog(address);
                }
          }
          shouldHideBalance={profile.shouldHideBalance}
          unitOfAccountSetting={profile.unitOfAccount}
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
            walletAddress={paramAddress}
            amount={(() => {
              const val = uiDialogs.getParam<?string>('amount');
              if (val == null) return null;
              return new BigNumber(val);
            })()}
            onClose={() => stores.uiDialogs.closeActiveDialog()}
            onGenerate={(address, amount) => {
              this.generateURI(address, amount);
            }}
            tokenInfo={defaultTokenInfo}
            validateAmount={(amount, tokenRow) =>
              validateAmount(
                amount,
                tokenRow,
                // we don't impose a minimum value for the creation of the QR codes
                // since validation happens when the QR code is scanned anyway
                new BigNumber(0),
                this.context.intl
              )
            }
          />
        ) : null}

        {uiDialogs.isOpen(URIDisplayDialog) ? (
          <URIDisplayDialog
            address={paramAddress}
            amount={new BigNumber(paramAmount)}
            onClose={stores.uiDialogs.closeActiveDialog}
            onBack={() => this.openURIGenerateDialog(paramAddress, paramAmount)}
            onCopyAddressTooltip={elementId => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                uiNotifications.open({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={uiNotifications.getTooltipActiveNotification(this.notificationElementId)}
          />
        ) : null}

        {uiDialogs.isOpen(UnmangleTxDialogContainer) && (
          <UnmangleTxDialogContainer
            stores={stores}
            onClose={() => this.props.stores.uiDialogs.closeActiveDialog()}
          />
        )}

        {uiDialogs.isOpen(VerifyAddressDialog) && hwVerifyAddress.selectedAddress ? (
          <VerifyAddressDialog
            isActionProcessing={hwVerifyAddress.isActionProcessing}
            selectedExplorer={selectedExplorerForNetwork}
            error={hwVerifyAddress.error}
            addressInfo={hwVerifyAddress.selectedAddress}
            onCopyAddressTooltip={elementId => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                uiNotifications.open({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={uiNotifications.getTooltipActiveNotification(this.notificationElementId)}
            isHardware={isHwWallet}
            verify={() => stores.substores.ada.hwVerifyAddress.verifyAddress(publicDeriver)}
            cancel={stores.substores.ada.hwVerifyAddress.closeAddressDetailDialog}
            complexityLevel={profile.selectedComplexityLevel}
          />
        ) : null}
      </VerticalFlexContainer>
    );
  }

  getTypeStore: (
    any // unused for now
  ) => void | {|
    +request: IAddressTypeUiSubset,
    +meta: AddressSubgroupMeta<IAddressTypeStore>,
  |} = _publicDeriver => {
    for (const addressStore of allAddressSubgroups) {
      if (!addressStore.isRelated()) {
        continue;
      }
      if (this.props.stores.app.currentRoute.startsWith(routeForStore(addressStore.name))) {
        const request = this.props.stores.addresses.addressSubgroupMap.get(addressStore.class);
        if (request == null) throw new Error('Should never happen');
        return {
          request,
          meta: addressStore,
        };
      }
    }
    Logger.error(`${nameof(WalletReceivePage)} unexpected address tab`);
  };

  openVerifyAddressDialog: void => void = (): void => {
    const { stores } = this.props;
    stores.uiDialogs.open({ dialog: VerifyAddressDialog });
  };

  openURIGenerateDialog: (address: string, amount?: string) => void = (address, amount) => {
    const { stores } = this.props;
    stores.uiDialogs.open({
      dialog: URIGenerateDialog,
      params: { address, amount },
    });
  };

  generateURI: (string, BigNumber) => void = (address, amount) => {
    const { stores } = this.props;
    stores.uiDialogs.open({
      dialog: URIDisplayDialog,
      params: { address, amount: amount.toString() },
    });
  };
}
