// @flow
import type { ComponentType, Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { messages } from '../../../components/wallet/settings/RemoveWallet';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { withLayout } from '../../../styles/context/layout';
import globalMessages from '../../../i18n/global-messages';

import DangerousActionDialog from '../../../components/widgets/Dialog/DangerousActionDialog';

type Props = {|
  ...StoresAndActionsProps,
  publicDeriver: void | PublicDeriver<>,
|};
type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

const dialogMessages = defineMessages({
  warning2: {
    id: 'wallet.settings.delete.warning2',
    defaultMessage:
      '!!!Please double-check you still have the means to restore access to this wallet.' +
      ' If you cannot, removing the wallet may result in irreversible loss of funds.',
  },
  accept: {
    id: 'wallet.settings.delete.accept',
    defaultMessage: '!!!I still have the means to restore this wallet',
  },
});

@observer
class RemoveWalletDialogContainer extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    this.props.stores.walletSettings.removeWalletRequest.reset();
  }

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    if (this.props.stores.walletSettings.removeWalletRequest.isExecuting) return;
    this.isChecked = !this.isChecked;
  };

  removeWalletRevamp: void => Promise<void> = async () => {
    const settingsActions = this.props.actions.walletSettings;
    const selectedWalletId = this.props.publicDeriver?.getPublicDeriverId();
    const walletsNavigation = this.props.stores.profile.walletsNavigation;

    if (this.props.publicDeriver) {
      const newWalletsNavigation = {
        ...walletsNavigation,
        // $FlowFixMe[invalid-computed-prop]
        cardano: walletsNavigation.cardano.filter(walletId => walletId !== selectedWalletId),
      };
      await this.props.actions.profile.updateSortedWalletList.trigger(newWalletsNavigation);
    }

    if (this.props.publicDeriver != null) {
      settingsActions.removeWallet.trigger({
        publicDeriver: this.props.publicDeriver,
      });
    }
  };

  render(): Node {
    const { intl } = this.context;
    const settingsStore = this.props.stores.walletSettings;
    const settingsActions = this.props.actions.walletSettings;

    const DangerousActionDialogClassic = (
      <DangerousActionDialog
        title={intl.formatMessage(messages.titleLabel)}
        checkboxAcknowledge={intl.formatMessage(dialogMessages.accept)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        isSubmitting={settingsStore.removeWalletRequest.isExecuting}
        error={settingsStore.removeWalletRequest.error}
        onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
        primaryButton={{
          label: intl.formatMessage(globalMessages.remove),
          onClick: () =>
            this.props.publicDeriver &&
            settingsActions.removeWallet.trigger({
              publicDeriver: this.props.publicDeriver,
            }),
        }}
        secondaryButton={{
          onClick: this.props.actions.dialogs.closeActiveDialog.trigger,
        }}
        id="removeWalletDialog"
      >
        <p>{intl.formatMessage(messages.removeExplanation)}</p>
        <p>{intl.formatMessage(dialogMessages.warning2)}</p>
      </DangerousActionDialog>
    );
    const DangerousActionDialogRevamp = (
      <DangerousActionDialog
        title={intl.formatMessage(messages.titleLabel)}
        checkboxAcknowledge={intl.formatMessage(dialogMessages.accept)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        isSubmitting={settingsStore.removeWalletRequest.isExecuting}
        error={settingsStore.removeWalletRequest.error}
        onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
        primaryButton={{
          label: intl.formatMessage(globalMessages.remove),
          onClick: this.removeWalletRevamp,
        }}
        secondaryButton={{
          onClick: this.props.actions.dialogs.closeActiveDialog.trigger,
        }}
        id="removeWalletDialog"
      >
        <p>{intl.formatMessage(messages.removeExplanation)}</p>
        <p>{intl.formatMessage(dialogMessages.warning2)}</p>
      </DangerousActionDialog>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: DangerousActionDialogClassic,
      REVAMP: DangerousActionDialogRevamp,
    });
  }
}
export default (withLayout(RemoveWalletDialogContainer): ComponentType<Props>);
