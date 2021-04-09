// // @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notificationType';
import SignTxPage from '../components/signin/SignTxPage';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type { SigningMessage, PublicDeriverCache } from '../../../chrome/extension/ergo-connector/types';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import BigNumber from 'bignumber.js';

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

  componentWillUnmount() {
    window.removeEventListener('unload', this.onUnload);
  }

  onConfirm: string => void = password => {
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

    const selectedWallet = this.generated.stores.connector.wallets.find(
      wallet => wallet.publicDeriver.getPublicDeriverId() === signingMessage.publicDeriverId
    );
    if (selectedWallet == null) return this.renderLoading();

    let component = null;
    // TODO: handle other sign types
    switch (signingMessage.sign.type) {
      case 'tx': {
        const txData = signingMessage.sign.tx ?? '';
        component = (
          <SignTxPage
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
            totalAmount={this.generated.stores.connector.totalAmount}
            getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
            defaultToken={selectedWallet.publicDeriver.getParent().getDefaultToken()}
            network={selectedWallet.publicDeriver.getParent().getNetworkInfo()}
            onConfirm={this.onConfirm}
            onCancel={this.onCancel}
          />
        );
        break;
      }
      default:
        component = null;
    }

    return <>{component}</>;
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
      connector: {|
        signingMessage: ?SigningMessage,
        totalAmount: ?BigNumber,
        wallets: Array<PublicDeriverCache>,
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
        connector: {
          signingMessage: stores.connector.signingMessage,
          totalAmount: stores.connector.totalAmount,
          wallets: stores.connector.wallets,
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
