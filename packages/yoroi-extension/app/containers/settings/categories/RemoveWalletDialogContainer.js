// @flow
import type { Node, ComponentType } from 'react';
import { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { messages } from '../../../components/wallet/settings/RemoveWallet';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

import DangerousActionDialog from '../../../components/widgets/DangerousActionDialog';
import LocalizableError from '../../../i18n/LocalizableError';
import { withLayout } from '../../../styles/context/layout';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import { getWalletType } from '../../../stores/toplevel/WalletSettingsStore';
import type { WalletsNavigation } from '../../../api/localStorage'
import { trackRemoveWallet } from '../../../api/analytics';

export type GeneratedData = typeof RemoveWalletDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: void | PublicDeriver<>,
|};
type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
type AllProps = {| ...Props, ...InjectedProps |};

const dialogMessages = defineMessages({
  warning2: {
    id: 'wallet.settings.delete.warning2',
    defaultMessage:
      '!!!Please double-check you still have the means to restore access to this wallet. If you cannot, removing the wallet may result in irreversible loss of funds.',
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
    this.generated.stores.walletSettings.removeWalletRequest.reset();
  }

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    if (this.generated.stores.walletSettings.removeWalletRequest.isExecuting) return;
    this.isChecked = !this.isChecked;
  };

  removeWalletRevamp: void => Promise<void> = async () => {
    const settingsActions = this.generated.actions.walletSettings;

    const selectedWalletId = this.props.publicDeriver?.getPublicDeriverId();
    const walletsNavigation = this.generated.stores.profile.walletsNavigation;
    if (this.props.publicDeriver) {
      const walletType = getWalletType(this.props.publicDeriver)
      const newWalletsNavigation = {
        ...walletsNavigation,
        // $FlowFixMe[invalid-computed-prop]
        [walletType]: walletsNavigation[walletType].filter(
          walletId => walletId !== selectedWalletId
        ),
        quickAccess: walletsNavigation.quickAccess.filter(walletId => walletId !== selectedWalletId)
      }
      await this.generated.actions.profile.updateSortedWalletList.trigger(newWalletsNavigation);
      trackRemoveWallet();
    }

    this.props.publicDeriver &&
      settingsActions.removeWallet.trigger({
        publicDeriver: this.props.publicDeriver,
      });
  };

  render(): Node {
    const { intl } = this.context;
    const settingsStore = this.generated.stores.walletSettings;
    const settingsActions = this.generated.actions.walletSettings;

    const DangerousActionDialogClassic = (
      <DangerousActionDialog
        title={intl.formatMessage(messages.titleLabel)}
        checkboxAcknowledge={intl.formatMessage(dialogMessages.accept)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        isSubmitting={settingsStore.removeWalletRequest.isExecuting}
        error={settingsStore.removeWalletRequest.error}
        onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
        primaryButton={{
          label: intl.formatMessage(globalMessages.remove),
          onClick: () => {
            if (this.props.publicDeriver != null) {
              settingsActions.removeWallet.trigger({
                publicDeriver: this.props.publicDeriver,
              });
              trackRemoveWallet();
            }
          }
        }}
        secondaryButton={{
          onClick: this.generated.actions.dialogs.closeActiveDialog.trigger,
        }}
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
        onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
        primaryButton={{
          label: intl.formatMessage(globalMessages.remove),
          onClick: this.removeWalletRevamp,
        }}
        secondaryButton={{
          onClick: this.generated.actions.dialogs.closeActiveDialog.trigger,
        }}
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

  @computed get generated(): {|
    actions: {|
      profile: {|
        updateSortedWalletList: {|
          trigger: WalletsNavigation => Promise<void>,
        |},
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
      |},
      walletSettings: {|
        removeWallet: {|
          trigger: (params: {|
            publicDeriver: PublicDeriver<>,
          |}) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      profile: {|
        walletsNavigation: WalletsNavigation,
      |},
      walletSettings: {|
        removeWalletRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void,
        |},
      |},
      wallets: {|
        publicDerivers: Array<PublicDeriver<>>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(RemoveWalletDialogContainer)} no way to generated props`);
    }
    const { actions, stores } = this.props;
    const settingActions = actions.walletSettings;
    const settingStore = stores.walletSettings;
    return Object.freeze({
      stores: {
        wallets: {
          publicDerivers: stores.wallets.publicDerivers,
        },
        profile: {
          walletsNavigation: stores.profile.walletsNavigation,
        },
        walletSettings: {
          removeWalletRequest: {
            reset: settingStore.removeWalletRequest.reset,
            isExecuting: settingStore.removeWalletRequest.isExecuting,
            error: settingStore.removeWalletRequest.error,
          },
        },
      },
      actions: {
        profile: {
          updateSortedWalletList: { trigger: actions.profile.updateSortedWalletList.trigger },
        },
        walletSettings: {
          removeWallet: { trigger: settingActions.removeWallet.trigger },
        },
        dialogs: {
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }
}
export default (withLayout(RemoveWalletDialogContainer): ComponentType<Props>);
