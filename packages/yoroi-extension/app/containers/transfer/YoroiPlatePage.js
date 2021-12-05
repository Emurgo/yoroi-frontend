// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../i18n/global-messages';
import WalletRestoreVerifyDialog from '../../components/wallet/WalletRestoreVerifyDialog';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import config from '../../config';
import { generatePlates } from '../../stores/toplevel/WalletRestoreStore';
import type { PlateWithMeta } from '../../stores/toplevel/WalletRestoreStore';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { Notification } from '../../types/notificationType';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { RestoreModeType } from '../../actions/common/wallet-restore-actions';

export type GeneratedData = typeof YoroiPlatePage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +accountIndex: number,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
|};

@observer
export default class YoroiPlatePage extends Component<Props> {

  async componentDidMount() {
    const { yoroiTransfer } = this.generated.stores;

    if (!yoroiTransfer.mode) {
      throw new Error(`${nameof(YoroiPlatePage)} no mode selected`);
    }

    const plates = generatePlates(
      yoroiTransfer.recoveryPhrase,
      this.props.accountIndex,
      yoroiTransfer.mode,
      this.getSelectedNetwork(),
    );
    runInAction(() => {
      this.plates = plates;
    });
  }

  @observable notificationElementId: string = '';

  @observable plates: void | Array<PlateWithMeta>;

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
    return (
      <WalletRestoreVerifyDialog
        plates={this.plates}
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
        mode: RestoreModeType | void,
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
          mode: stores.yoroiTransfer.mode,
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
