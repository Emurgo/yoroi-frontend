// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import { Logger } from '../../../../utils/logging';
import { handleExternalLinkClick } from '../../../../utils/routing';
import GeneratePinDialog from '../../../../components/wallet/voting/GeneratePinDialog';
import ConfirmPinDialog from '../../../../components/wallet/voting/ConfirmPinDialog';
import QrCodeDialog from '../../../../components/wallet/voting/QrCodeDialog';
import TransactionDialogContainer from './TransactionDialogContainer';
import RegisterDialogContainer from './RegisterDialogContainer';
import type { GeneratedData as TransactionDialogData } from './TransactionDialogContainer';
import type { GeneratedData as RegisterDialogData } from './RegisterDialogContainer';
import { ProgressStep, ProgressInfo } from '../../../../stores/ada/VotingStore';
import type { WalletType } from '../../../../components/wallet/voting/types';
import globalMessages from '../../../../i18n/global-messages';

export type GeneratedData = typeof VotingRegistrationDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
  +walletType: WalletType,
|};

@observer
export default class VotingRegistrationDialogContainer extends Component<Props> {

  cancel: (() => void) = () => {
    this.props.onClose();
    this.generated.actions.ada.votingActions.cancel.trigger();
  };

  componentDidMount() {
    this.generated.actions.generateCatalystKey.trigger();
  }
  async componentWillUnmount() {
    this.generated.actions.ada.votingActions.cancel.trigger();
  }

  render(): null | Node {

    const { profile } = this.generated.stores;
    const votingStore = this.generated.stores.substores.ada.votingStore;
    const votingActions = this.generated.actions.ada.votingActions;
    const walletType = this.props.walletType;
    const stepsList = [
      globalMessages.stepPin,
      globalMessages.stepConfirm,
      ...(walletType === 'mnemonic' ? [globalMessages.registerLabel] : []),
      globalMessages.transactionLabel,
      globalMessages.stepQrCode,
    ];

    let component = null;

    switch (votingStore.progressInfo.currentStep) {
      case ProgressStep.GENERATE:
        component = (
          <GeneratePinDialog
            stepsList={stepsList}
            progressInfo={votingStore.progressInfo}
            pin={votingStore.pin}
            next={votingActions.submitGenerate.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
            onBack={this.props.onClose}
          />);
        break;
      case ProgressStep.CONFIRM:
        component = (
          <ConfirmPinDialog
            stepsList={stepsList}
            progressInfo={votingStore.progressInfo}
            goBack={votingActions.goBackToGenerate.trigger}
            submit={votingActions.submitConfirm.trigger}
            error={votingActions.submitConfirmError.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
            pinValidation={(enteredPin)=>{
                const pin = votingStore.pin.join('');
                return pin === enteredPin;
              }
            }
          />);
        break;
      case ProgressStep.REGISTER:
        component = (
          <RegisterDialogContainer
            {...this.generated.RegisterDialogProps}
            stepsList={stepsList}
            submit={votingActions.submitRegister.trigger}
            goBack={votingActions.goBackToRegister.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
            onError={votingActions.submitRegisterError.trigger}
          />);
        break;
      case ProgressStep.TRANSACTION:
        component = (
          <TransactionDialogContainer
            {...this.generated.TransactionDialogProps}
            stepsList={stepsList}
            classicTheme={profile.isClassicTheme}
            cancel={this.cancel}
            submit={votingActions.submitTransaction.trigger}
            goBack={votingActions.goBackToRegister.trigger}
            onError={votingActions.submitTransactionError.trigger}
            walletType={walletType}
          />);
        break;
      case ProgressStep.QR_CODE:
        component = (
          <QrCodeDialog
            stepsList={stepsList}
            progressInfo={votingStore.progressInfo}
            onExternalLinkClick={handleExternalLinkClick}
            submit={votingActions.finishQRCode.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
            votingKey={votingStore.encryptedKey}
          />);
        break;
      default:
        Logger.error(`${nameof(VotingRegistrationDialogContainer)}::${nameof(this.render)}: something unexpected happened`);
        break;
    }

    return component;
  }

  @computed get generated(): {|
    actions: {|
      generateCatalystKey: {| trigger: (params: void) => Promise<void> |},
      ada: {|
        votingActions: {|
          cancel: {| trigger: (params: void) => void |},
          submitGenerate: {| trigger: (params: void) => void |},
          goBackToGenerate: {|
            trigger: (params: void) => void
          |},
          submitConfirm: {|
            trigger: (params: void) => void
          |},
          submitConfirmError: {|
            trigger: (params: void) => void
          |},
          submitRegister: {|
            trigger: (params: void) => void
          |},
          submitRegisterError: {|
            trigger: (params: Error) => void
          |},
          goBackToRegister: {|
            trigger: (params: void) => void
          |},
          submitTransaction: {|
            trigger: (params: void) => void
          |},
          submitTransactionError: {|
            trigger: (params: Error) => void
          |},
          finishQRCode: {|
            trigger: (params: void) => void
          |},
        |}
      |}
    |},
    stores: {|
      profile: {|
        isClassicTheme: boolean,
      |},
      substores: {|
        ada: {|
          votingStore: {|
            pin: Array<number>,
            progressInfo: ProgressInfo,
            encryptedKey: string | null,
          |},
        |}
      |}
    |},
    TransactionDialogProps: InjectedOrGenerated<TransactionDialogData>,
    RegisterDialogProps: InjectedOrGenerated<RegisterDialogData>,
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(VotingRegistrationDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        substores: {
          ada: {
            votingStore: {
              progressInfo: stores.substores.ada.votingStore.progressInfo,
              pin: stores.substores.ada.votingStore.pin,
              encryptedKey: stores.substores.ada.votingStore.encryptedKey,
            },
          },
        },
      },
      actions: {
        ada: {
          votingActions: {
            submitGenerate: {
              trigger: actions.ada.voting.submitGenerate.trigger,
            },
            goBackToGenerate: {
              trigger: actions.ada.voting.goBackToGenerate.trigger,
            },
            submitConfirm: {
              trigger: () => { actions.ada.voting.submitConfirm.trigger() },
            },
            submitConfirmError: {
              trigger: actions.ada.voting.submitConfirmError.trigger,
            },
            submitRegister: {
              trigger: actions.ada.voting.submitRegister.trigger,
            },
            submitRegisterError: {
              trigger: actions.ada.voting.submitRegisterError.trigger,
            },
            goBackToRegister: {
              trigger: actions.ada.voting.goBackToRegister.trigger,
            },
            submitTransaction: {
              trigger: actions.ada.voting.submitTransaction.trigger,
            },
            submitTransactionError: {
              trigger: actions.ada.voting.submitTransactionError.trigger,
            },
            finishQRCode: {
              trigger: actions.ada.voting.finishQRCode.trigger,
            },
            cancel: {
              trigger: actions.ada.voting.cancel.trigger,
            },
          },
        },
        generateCatalystKey: { trigger: actions.ada.voting.generateCatalystKey.trigger },
      },
      TransactionDialogProps:
        ({ actions, stores, }: InjectedOrGenerated<TransactionDialogData>),
      RegisterDialogProps:
        ({ actions, stores, }: InjectedOrGenerated<RegisterDialogData>),
    });
  }
}
