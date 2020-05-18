// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../i18n/global-messages';
import WalletRestoreVerifyDialog from '../../components/wallet/WalletRestoreVerifyDialog';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import config from '../../config';
import {
  generateLedgerWalletRootKey,
  generateWalletRootKey,
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import type { PlateResponse } from '../../api/ada/lib/cardanoCrypto/plate';
import { TransferKind } from '../../types/TransferTypes';
import { generatePlates } from '../../stores/ada/WalletRestoreStore';
import { RestoreMode } from '../../actions/ada/wallet-restore-actions';

export type GeneratedData = typeof YoroiPlatePage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
|};
type WalletRestoreDialogContainerState = {|
  byronPlate: void | PlateResponse,
  shelleyPlate: void | PlateResponse,
|}

@observer
export default class YoroiPlatePage extends Component<Props> {

  async componentDidMount() {
    const { yoroiTransfer } = this.generated.stores.substores.ada;

    const rootPk = yoroiTransfer.transferKind === TransferKind.LEDGER
      ? generateLedgerWalletRootKey(yoroiTransfer.recoveryPhrase)
      : generateWalletRootKey(yoroiTransfer.recoveryPhrase);
    const { byronPlate, shelleyPlate } = generatePlates(
      rootPk,
      yoroiTransfer.transferKind === TransferKind.PAPER
        ? RestoreMode.PAPER
        : RestoreMode.PAPER
    );
    runInAction(() => {
      this.plates = {
        byronPlate,
        shelleyPlate,
      };
    });
  }

  @observable notificationElementId: string = '';

  @observable plates: void | WalletRestoreDialogContainerState;

  render(): null | Node {
    if (this.plates == null) return null;
    const actions = this.generated.actions;
    const { uiNotifications } = this.generated.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };
    const { byronPlate, shelleyPlate } = this.plates;
    return (
      <WalletRestoreVerifyDialog
        byronPlate={byronPlate}
        shelleyPlate={shelleyPlate}
        selectedExplorer={this.generated.stores.profile.selectedExplorer}
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
        notification={uiNotifications.getTooltipActiveNotification(
          this.notificationElementId
        )}
        onNext={this.props.onNext}
        onCancel={this.props.onCancel}
        isSubmitting={false}
        error={undefined}
      />
    );
  }

  @computed get generated() {
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
