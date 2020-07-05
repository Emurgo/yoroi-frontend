// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { Logger } from '../../../utils/logging';
import { handleExternalLinkClick } from '../../../utils/routing';

import CheckDialog from '../../../components/wallet/hwConnect/ledger/CheckDialog';
import ConnectDialog from '../../../components/wallet/hwConnect/ledger/ConnectDialog';
import SaveDialog from '../../../components/wallet/hwConnect/ledger/SaveDialog';

import { ProgressStep, ProgressInfo } from '../../../types/HWConnectStoreTypes';
import { getApiForNetwork, ApiOptions } from '../../../api/common/utils';
import LocalizableError from '../../../i18n/LocalizableError';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

export type GeneratedData = typeof WalletLedgerConnectDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +onBack: void => void,
|};

@observer
export default class WalletLedgerConnectDialogContainer extends Component<Props> {

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.generated.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(WalletLedgerConnectDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  }

  cancel: (() => void) = () => {
    const api = getApiForNetwork(this.getSelectedNetwork());
    if (api !== ApiOptions.ada) {
      throw new Error(`${nameof(WalletLedgerConnectDialogContainer)}::${nameof(this.cancel)} not ADA API`);
    }
    this.props.onClose();
    this.generated.actions[ApiOptions.ada].ledgerConnect.cancel.trigger();
  };

  render(): null | Node {
    const api = getApiForNetwork(this.getSelectedNetwork());
    if (api !== ApiOptions.ada) {
      throw new Error(`${nameof(WalletLedgerConnectDialogContainer)}::${nameof(this.render)} not ADA API`);
    }
    const { profile } = this.generated.stores;
    const ledgerConnectStore = this.generated.stores.substores[ApiOptions.ada].ledgerConnect;
    const hwConnectActions = this.generated.actions[ApiOptions.ada].ledgerConnect;

    let component = null;

    switch (ledgerConnectStore.progressInfo.currentStep) {
      case ProgressStep.CHECK:
        component = (
          <CheckDialog
            progressInfo={ledgerConnectStore.progressInfo}
            isActionProcessing={ledgerConnectStore.isActionProcessing}
            error={ledgerConnectStore.error}
            onExternalLinkClick={handleExternalLinkClick}
            submit={hwConnectActions.submitCheck.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
            onBack={this.props.onBack}
          />);
        break;
      case ProgressStep.CONNECT:
        component = (
          <ConnectDialog
            progressInfo={ledgerConnectStore.progressInfo}
            isActionProcessing={ledgerConnectStore.isActionProcessing}
            error={ledgerConnectStore.error}
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
            progressInfo={ledgerConnectStore.progressInfo}
            isActionProcessing={ledgerConnectStore.isActionProcessing}
            error={ledgerConnectStore.error}
            defaultWalletName={ledgerConnectStore.defaultWalletName}
            onExternalLinkClick={handleExternalLinkClick}
            submit={hwConnectActions.submitSave.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
          />);
        break;
      default:
        Logger.error('WalletLedgerConnectDialogContainer::render: something unexpected happened');
        break;
    }

    return component;
  }

  @computed get generated(): {|
    actions: {|
      ada: {|
        ledgerConnect: {|
          cancel: {| trigger: (params: void) => void |},
          goBackToCheck: {|
            trigger: (params: void) => void
          |},
          submitCheck: {| trigger: (params: void) => void |},
          submitConnect: {|
            trigger: (params: void) => Promise<void>
          |},
          submitSave: {|
            trigger: (params: string) => Promise<void>
          |}
        |}
      |}
    |},
    stores: {|
      profile: {|
        isClassicTheme: boolean,
        selectedNetwork: void | $ReadOnly<NetworkRow>
      |},
      substores: {|
        ada: {|
          ledgerConnect: {|
            defaultWalletName: string,
            error: ?LocalizableError,
            isActionProcessing: boolean,
            progressInfo: ProgressInfo
          |}
        |}
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletLedgerConnectDialogContainer)} no way to generated props`);
    }
    const { stores, actions, } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          selectedNetwork: stores.profile.selectedNetwork,
          isClassicTheme: stores.profile.isClassicTheme,
        },
        substores: {
          ada: {
            ledgerConnect: {
              progressInfo: stores.substores.ada.ledgerConnect.progressInfo,
              isActionProcessing: stores.substores.ada.ledgerConnect.isActionProcessing,
              error: stores.substores.ada.ledgerConnect.error,
              defaultWalletName: stores.substores.ada.ledgerConnect.defaultWalletName,
            },
          },
        },
      },
      actions: {
        ada: {
          ledgerConnect: {
            submitCheck: {
              trigger: actions.ada.ledgerConnect.submitCheck.trigger,
            },
            goBackToCheck: {
              trigger: actions.ada.ledgerConnect.goBackToCheck.trigger,
            },
            submitConnect: {
              trigger: actions.ada.ledgerConnect.submitConnect.trigger,
            },
            submitSave: {
              trigger: actions.ada.ledgerConnect.submitSave.trigger,
            },
            cancel: {
              trigger: actions.ada.ledgerConnect.cancel.trigger,
            },
          },
        },
      },
    });
  }
}
