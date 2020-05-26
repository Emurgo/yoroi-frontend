// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { Logger } from '../../../utils/logging';
import { handleExternalLinkClick } from '../../../utils/routing';

import CheckDialog from '../../../components/wallet/hwConnect/trezor/CheckDialog';
import ConnectDialog from '../../../components/wallet/hwConnect/trezor/ConnectDialog';
import SaveDialog from '../../../components/wallet/hwConnect/trezor/SaveDialog';

import { ProgressStep } from '../../../types/HWConnectStoreTypes';

export type GeneratedData = typeof WalletTrezorConnectDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: (void) => void,
  +onBack: void => void,
|};

@observer
export default class WalletTrezorConnectDialogContainer extends Component<Props> {

  cancel: void => void = () => {
    this.props.onClose();
    this.generated.actions[
      this.generated.stores.profile.selectedAPI.type
    ].trezorConnect.cancel.trigger();
  };

  render(): null | Node {
    const { profile } = this.generated.stores;
    const trezorConnectStore = this._getTrezorConnectStore();
    const hwConnectActions = this.generated.actions[
      this.generated.stores.profile.selectedAPI.type
    ].trezorConnect;

    let component = null;

    switch (trezorConnectStore.progressInfo.currentStep) {
      case ProgressStep.CHECK:
        component = (
          <CheckDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            onExternalLinkClick={handleExternalLinkClick}
            submit={hwConnectActions.submitCheck.trigger}
            cancel={this.cancel}
            onBack={this.props.onBack}
            classicTheme={profile.isClassicTheme}
          />);
        break;
      case ProgressStep.CONNECT:
        component = (
          <ConnectDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            onExternalLinkClick={handleExternalLinkClick}
            goBack={hwConnectActions.goBackToCheck.trigger}
            submit={hwConnectActions.submitConnect.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
          />);
        break;
      case ProgressStep.SAVE:
        component = (
          <SaveDialog
            progressInfo={trezorConnectStore.progressInfo}
            isActionProcessing={trezorConnectStore.isActionProcessing}
            error={trezorConnectStore.error}
            defaultWalletName={trezorConnectStore.defaultWalletName}
            onExternalLinkClick={handleExternalLinkClick}
            submit={hwConnectActions.submitSave.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
          />);
        break;
      default:
        Logger.error('WalletTrezorConnectDialogContainer::render: something unexpected happened');
        break;
    }

    return component;
  }

  /** Returns the store which is responsible for this Container */
  _getTrezorConnectStore() {
    return this.generated.stores.substores[
      this.generated.stores.profile.selectedAPI.type
    ].trezorConnect;
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletTrezorConnectDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          selectedAPI: stores.profile.selectedAPI,
          isClassicTheme: stores.profile.isClassicTheme,
        },
        substores: {
          ada: {
            trezorConnect: {
              progressInfo: stores.substores.ada.trezorConnect.progressInfo,
              isActionProcessing: stores.substores.ada.trezorConnect.isActionProcessing,
              error: stores.substores.ada.trezorConnect.error,
              defaultWalletName: stores.substores.ada.trezorConnect.defaultWalletName,
            },
          },
        },
      },
      actions: {
        ada: {
          trezorConnect: {
            submitCheck: {
              trigger: actions.ada.trezorConnect.submitCheck.trigger,
            },
            goBackToCheck: {
              trigger: actions.ada.trezorConnect.goBackToCheck.trigger,
            },
            submitConnect: {
              trigger: actions.ada.trezorConnect.submitConnect.trigger,
            },
            submitSave: {
              trigger: actions.ada.trezorConnect.submitSave.trigger,
            },
            cancel: {
              trigger: actions.ada.trezorConnect.cancel.trigger,
            },
          },
        },
      },
    });
  }
}
