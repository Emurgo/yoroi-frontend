// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notificationType';
import SignTxPage from '../components/signin/SignTxPage';
import CardanoSignTxPage from '../components/signin/CardanoSignTxPage';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type {
  SigningMessage,
  PublicDeriverCache,
  WhitelistEntry,
} from '../../../chrome/extension/ergo-connector/types';
import { genLookupOrFail, genLookupOrNull } from '../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { asGetSigningKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  CardanoConnectorSignRequest,
  SignSubmissionErrorType,
} from '../types';
import { Box } from '@mui/material';

type GeneratedData = typeof SignTxContainer.prototype.generated;

@observer
export default class SignTxContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>
> {
  @observable notificationElementId: string = '';

  onUnload: (SyntheticEvent<>) => void = ev => {
    ev.preventDefault();
    this.generated.actions.connector.cancelSignInTx.trigger();
  };

  componentDidMount() {
    this.generated.actions.connector.refreshWallets.trigger();
    window.addEventListener('unload', this.onUnload);
  }

  onConfirm: (PublicDeriver<> => (string => Promise<void>)) = deriver => async (password) => {
    const withSigningKey = asGetSigningKey(deriver);
    if (!withSigningKey) {
      throw new Error(`[sign tx] no signing key`);
    }
    const signingKeyFromStorage = await withSigningKey.getSigningKey();
    // will throw a WrongPasswordError
    await withSigningKey.normalizeKey({
      ...signingKeyFromStorage,
      password,
    });
    window.removeEventListener('unload', this.onUnload);
    this.generated.actions.connector.confirmSignInTx.trigger(password);
  };
  onCancel: () => void = () => {
    this.generated.actions.connector.cancelSignInTx.trigger();
  };

  renderLoading(): Node {
    return (
      <FullscreenLayout bottomPadding={0}>
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      </FullscreenLayout>
    );
  }

  render(): Node {
    const actions = this.generated.actions;
    const { uiNotifications } = this.generated.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const { signingMessage } = this.generated.stores.connector;
    if (signingMessage == null) return this.renderLoading();

    const selectedWallet = this.generated.stores.connector.filteredWallets.find(
      wallet => wallet.publicDeriver.getPublicDeriverId() === signingMessage.publicDeriverId
    );
    if (selectedWallet == null) return this.renderLoading();
    const whitelistEntries = this.generated.stores.connector.currentConnectorWhitelist;
    const connectedWebsite = whitelistEntries.find(
      cacheEntry => selectedWallet.publicDeriver.getPublicDeriverId() === cacheEntry.publicDeriverId
    );

    let component = null;
    // TODO: handle other sign types
    switch (signingMessage.sign.type) {
      case 'tx': {
        const txData = this.generated.stores.connector.signingRequest;
        if (txData == null) return this.renderLoading();
        component = (
          <SignTxPage
            shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
            connectedWebsite={connectedWebsite}
            selectedWallet={selectedWallet}
            onCopyAddressTooltip={(address, elementId) => {
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
            notification={
              this.notificationElementId == null
                ? null
                : uiNotifications.getTooltipActiveNotification(this.notificationElementId)
            }
            tx={signingMessage.sign.tx}
            txData={txData}
            getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
            defaultToken={selectedWallet.publicDeriver.getParent().getDefaultToken()}
            network={selectedWallet.publicDeriver.getParent().getNetworkInfo()}
            onConfirm={(password) => this.onConfirm(selectedWallet.publicDeriver)(password)}
            onCancel={this.onCancel}
            addressToDisplayString={addr =>
              addressToDisplayString(
                addr,
                selectedWallet.publicDeriver.getParent().getNetworkInfo()
              )
            }
            getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
            selectedExplorer={
              this.generated.stores.explorers.selectedExplorer.get(
                selectedWallet.publicDeriver.getParent().getNetworkInfo().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          />
        );
        break;
      }
      case 'tx-reorg/cardano':
      case 'data':
      case 'tx/cardano': {
        const txData = this.generated.stores.connector.adaTransaction;
        const signData = signingMessage.sign.type === 'data'
          ? { address: signingMessage.sign.address, payload: signingMessage.sign.payload }
          : null;
        if (txData == null && signData == null) return this.renderLoading();
        component = (
          <CardanoSignTxPage
            shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
            connectedWebsite={connectedWebsite}
            selectedWallet={selectedWallet}
            onCopyAddressTooltip={(address, elementId) => {
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
            notification={
              this.notificationElementId == null
                ? null
                : uiNotifications.getTooltipActiveNotification(this.notificationElementId)
            }
            txData={txData}
            getTokenInfo={genLookupOrNull(this.generated.stores.tokenInfoStore.tokenInfo)}
            defaultToken={selectedWallet.publicDeriver.getParent().getDefaultToken()}
            network={selectedWallet.publicDeriver.getParent().getNetworkInfo()}
            onConfirm={(password) => this.onConfirm(selectedWallet.publicDeriver)(password)}
            onCancel={this.onCancel}
            addressToDisplayString={addr =>
              addressToDisplayString(
                addr,
                selectedWallet.publicDeriver.getParent().getNetworkInfo()
              )
            }
            getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
            selectedExplorer={
              this.generated.stores.explorers.selectedExplorer.get(
                selectedWallet.publicDeriver.getParent().getNetworkInfo().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
            isReorg={signingMessage.sign.type === 'tx-reorg/cardano'}
            submissionError={this.generated.stores.connector.submissionError}
            signData={signData}
          />
        );
        break;
      }
      default:
        component = null;
    }

    return  (
      <Box
        sx={{
          height: 'calc(100vh - 52px)',
          backgroundColor: 'var(--yoroi-palette-common-white)'
        }}
      >
        {component}
      </Box>
    )
  }

  @computed get generated(): {|
    actions: {|
      notifications: {|
        closeActiveNotification: {|
          trigger: (params: {| id: string |}) => void,
        |},
        open: {| trigger: (params: Notification) => void |},
      |},
      connector: {|
        cancelSignInTx: {|
          trigger: (params: void) => void,
        |},
        confirmSignInTx: {| trigger: (params: string) => void |},
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
      |},
      connector: {|
        signingMessage: ?SigningMessage,
        filteredWallets: Array<PublicDeriverCache>,
        signingRequest: ?ISignRequest<any>,
        adaTransaction: ?CardanoConnectorSignRequest,
        currentConnectorWhitelist: Array<WhitelistEntry>,
        submissionError: ?SignSubmissionErrorType,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        unitOfAccount: UnitOfAccountSettingType,
        shouldHideBalance: boolean,
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SignTxContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        connector: {
          signingMessage: stores.connector.signingMessage,
          filteredWallets: stores.connector.filteredWallets,
          signingRequest: stores.connector.signingRequest,
          adaTransaction: stores.connector.adaTransaction,
          currentConnectorWhitelist: stores.connector.currentConnectorWhitelist,
          submissionError: stores.connector.submissionError,
        },
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          unitOfAccount: stores.profile.unitOfAccount,
          shouldHideBalance: stores.profile.shouldHideBalance,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
      },
      actions: {
        connector: {
          confirmSignInTx: { trigger: actions.connector.confirmSignInTx.trigger },
          refreshWallets: { trigger: actions.connector.refreshWallets.trigger },
          cancelSignInTx: { trigger: actions.connector.cancelSignInTx.trigger },
        },
        notifications: {
          closeActiveNotification: {
            trigger: actions.notifications.closeActiveNotification.trigger,
          },
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
      },
    });
  }
}
