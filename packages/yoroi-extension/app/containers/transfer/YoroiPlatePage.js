// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import globalMessages from '../../i18n/global-messages';
import WalletRestoreVerifyDialog from '../../components/wallet/WalletRestoreVerifyDialog';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import config from '../../config';
import { generatePlates } from '../../stores/toplevel/WalletRestoreStore';
import type { PlateWithMeta } from '../../stores/toplevel/WalletRestoreStore';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  ...StoresAndActionsProps,
  +accountIndex: number,
  +onNext: void => PossiblyAsync<void>,
  +onCancel: void => void,
|};

@observer
export default class YoroiPlatePage extends Component<Props> {

  async componentDidMount() {
    const { yoroiTransfer } = this.props.stores;
    const plates = generatePlates(
      yoroiTransfer.recoveryPhrase,
      this.props.accountIndex,
      this.getSelectedNetwork(),
    );
    runInAction(() => {
      this.plates = plates;
    });
  }

  @observable notificationElementId: string = '';

  @observable plates: void | Array<PlateWithMeta>;

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.props.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(YoroiPlatePage)} no API selected`);
    }
    return selectedNetwork;
  }

  render(): null | Node {
    if (this.plates == null) return null;
    const actions = this.props.actions;
    const { uiNotifications } = this.props.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };
    return (
      <WalletRestoreVerifyDialog
        plates={this.plates}
        selectedExplorer={this.props.stores.explorers.selectedExplorer
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
}
