// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';

import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { Logger } from '../../../utils/logging';
import { handleExternalLinkClick } from '../../../utils/routing';

import CheckDialog from '../../../components/wallet/hwConnect/trezor/CheckDialog';
import ConnectDialog from '../../../components/wallet/hwConnect/trezor/ConnectDialog';
import SaveDialog from '../../../components/wallet/hwConnect/trezor/SaveDialog';

import { ProgressStep } from '../../../types/HWConnectStoreTypes';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  ...StoresAndActionsProps,
  +onClose: (void) => void,
  +onBack: void => void,
|};

@observer
export default class WalletTrezorConnectDialogContainer extends Component<Props> {

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.props.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(WalletTrezorConnectDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  }

  cancel: void => void = () => {
    this.props.onClose();
    this.props.actions.ada.trezorConnect.cancel.trigger();
  };

  render(): null | Node {
    const { profile } = this.props.stores;
    const trezorConnectStore = this.props.stores.substores.ada.trezorConnect;
    const hwConnectActions = this.props.actions.ada.trezorConnect;

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
        Logger.error(`${nameof(WalletTrezorConnectDialogContainer)}::render: something unexpected happened`);
        break;
    }

    return component;
  }
}
