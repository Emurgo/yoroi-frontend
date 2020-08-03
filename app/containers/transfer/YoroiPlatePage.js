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
import type { PlateResponse } from '../../api/common/lib/crypto/plate';
import { TransferKind, TransferSource } from '../../types/TransferTypes';
import { generatePlates } from '../../stores/toplevel/WalletRestoreStore';
import { RestoreMode } from '../../actions/common/wallet-restore-actions';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { TransferKindType, TransferSourceType, } from '../../types/TransferTypes';
import type { Notification } from '../../types/notificationType';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';

export type GeneratedData = typeof YoroiPlatePage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +accountIndex: number,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
|};
type WalletRestoreDialogContainerState = {|
  byronPlate: void | PlateResponse,
  jormungandrPlate: void | PlateResponse,
  shelleyPlate: void | PlateResponse,
|}

@observer
export default class YoroiPlatePage extends Component<Props> {

  async componentDidMount() {
    const { yoroiTransfer } = this.generated.stores;

    const rootPk = yoroiTransfer.transferKind === TransferKind.LEDGER
      ? generateLedgerWalletRootKey(yoroiTransfer.recoveryPhrase)
      : generateWalletRootKey(yoroiTransfer.recoveryPhrase);

    const getRestoreMode = () => {
      if (yoroiTransfer.transferKind === TransferKind.PAPER) {
        return RestoreMode.PAPER;
      }
      if (yoroiTransfer.transferSource === TransferSource.BYRON) {
        return RestoreMode.REGULAR_15;
      }
      if (yoroiTransfer.transferSource === TransferSource.JORMUNGANDR_UTXO) {
        return RestoreMode.REGULAR_15;
      }
      if (yoroiTransfer.transferSource === TransferSource.JORMUNGANDR_CHIMERIC_ACCOUNT) {
        return RestoreMode.REGULAR_15;
      }
      if (yoroiTransfer.transferSource === TransferSource.SHELLEY) {
        return RestoreMode.REGULAR_24;
      }
      throw new Error(`${nameof(YoroiPlatePage)} unknown mode`);
    };
    const { byronPlate, shelleyPlate, jormungandrPlate } = generatePlates(
      rootPk,
      this.props.accountIndex,
      getRestoreMode(),
      this.getSelectedNetwork(),
    );
    runInAction(() => {
      this.plates = {
        byronPlate,
        jormungandrPlate,
        shelleyPlate,
      };
    });
  }

  @observable notificationElementId: string = '';

  @observable plates: void | WalletRestoreDialogContainerState;

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.generated.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(YoroiPlatePage)} no API selected`);
    }
    return selectedNetwork;
  }

  render(): null | Node {
    if (this.plates == null) return null;
    const actions = this.generated.actions;
    const { uiNotifications } = this.generated.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };
    const { byronPlate, shelleyPlate, jormungandrPlate } = this.plates;
    return (
      <WalletRestoreVerifyDialog
        shelleyPlate={shelleyPlate}
        byronPlate={byronPlate}
        jormungandrPlate={jormungandrPlate}
        selectedExplorer={this.generated.stores.explorers.selectedExplorer
          .get(this.getSelectedNetwork().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
        }
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

  @computed get generated(): {|
    actions: {|
      notifications: {|
        open: {| trigger: (params: Notification) => void |}
      |}
    |},
    stores: {|
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        selectedNetwork: void | $ReadOnly<NetworkRow>,
      |},
      yoroiTransfer: {|
        recoveryPhrase: string,
        transferKind: TransferKindType,
        transferSource: TransferSourceType
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(YoroiPlatePage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
        },
        yoroiTransfer: {
          transferKind: stores.yoroiTransfer.transferKind,
          transferSource: stores.yoroiTransfer.transferSource,
          recoveryPhrase: stores.yoroiTransfer.recoveryPhrase,
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
