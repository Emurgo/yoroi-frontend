// @flow
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../i18n/global-messages';
import WalletRestoreVerifyDialog from '../../components/wallet/WalletRestoreVerifyDialog';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { ExplorerType } from '../../domain/Explorer';
import config from '../../config';
import {
  generateStandardPlate,
} from '../../api/ada/lib/cardanoCrypto/plate';
import {
  generateLedgerWalletRootKey,
  generateWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import environment from '../../environment';
import type { PlateResponse } from '../../api/ada/lib/cardanoCrypto/plate';
import { TransferKind } from '../../types/TransferTypes';
import NotificationActions from '../../actions/notifications-actions';
import type { Notification } from '../../types/notificationType';
import type { TransferKindType, } from '../../types/TransferTypes';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
|};
type WalletRestoreDialogContainerState = {|
  byronPlate: void | PlateResponse,
  shelleyPlate: void | PlateResponse,
  notificationElementId: string,
|}

const NUMBER_OF_VERIFIED_ADDRESSES = 1;
const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

@observer
export default class YoroiPlatePage extends Component<Props, WalletRestoreDialogContainerState> {

  async componentDidMount() {
    await RustModule.load();
    const { yoroiTransfer } = this.generated.stores.substores.ada;

    const numAddresses = yoroiTransfer.transferKind === TransferKind.PAPER
      ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER
      : NUMBER_OF_VERIFIED_ADDRESSES;

    const rootPk = yoroiTransfer.transferKind === TransferKind.LEDGER
      ? generateLedgerWalletRootKey(yoroiTransfer.recoveryPhrase)
      : generateWalletRootKey(yoroiTransfer.recoveryPhrase);
    const byronPlate = generateStandardPlate(
      rootPk,
      0, // show addresses for account #0
      numAddresses,
      environment.getDiscriminant(),
      true,
    );
    const shelleyPlate = yoroiTransfer.transferKind === TransferKind.PAPER
      ? undefined
      : generateStandardPlate(
        rootPk,
        0, // show addresses for account #0
        numAddresses,
        environment.getDiscriminant(),
        false,
      );
    this.state = {
      byronPlate,
      shelleyPlate,
      notificationElementId: '',
    };
  }

  state: WalletRestoreDialogContainerState;

  render() {
    if (this.state == null) return null;
    const actions = this.generated.actions;
    const { uiNotifications } = this.generated.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };
    const { byronPlate, shelleyPlate } = this.state;
    return (
      <WalletRestoreVerifyDialog
        byronPlate={byronPlate}
        shelleyPlate={shelleyPlate}
        selectedExplorer={this.generated.stores.profile.selectedExplorer}
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
        notification={uiNotifications.getTooltipActiveNotification(
          this.state.notificationElementId
        )}
        onNext={this.props.onNext}
        onCancel={this.props.onCancel}
        isSubmitting={false}
        classicTheme={this.generated.stores.profile.isClassicTheme}
        error={undefined}
      />
    );
  }

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(YoroiPlatePage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStores = stores.substores.ada;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          selectedExplorer: stores.profile.selectedExplorer,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        substores: {
          ada: {
            yoroiTransfer: {
              transferKind: adaStores.yoroiTransfer.transferKind,
              recoveryPhrase: adaStores.yoroiTransfer.recoveryPhrase,
            },
          },
        },
      },
      actions: {
        notifications: {
          open: { trigger: actions.notifications.open.trigger },
        },
      },
    });
  }
}

export type GeneratedData = {|
  +stores: {|
    +profile: {|
      +isClassicTheme: boolean,
      +selectedExplorer: ExplorerType,
    |},
    +uiNotifications: {|
      +isOpen: any => boolean,
      +getTooltipActiveNotification: string => ?Notification,
    |},
    +substores: {|
      +ada: {|
        +yoroiTransfer: {|
          +transferKind: TransferKindType,
          +recoveryPhrase: string,
        |},
      |},
    |},
  |},
  +actions: {|
    +notifications: {|
      +open: {|
        +trigger: typeof NotificationActions.prototype.open.trigger
      |},
    |},
  |},
|};
