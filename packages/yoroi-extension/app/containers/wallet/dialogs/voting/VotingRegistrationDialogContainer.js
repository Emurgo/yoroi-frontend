// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import { Logger } from '../../../../utils/logging';
import { handleExternalLinkClick } from '../../../../utils/routing';
import DoneDialog from '../../../../components/wallet/voting/DoneDialog';
import TransactionDialogContainer from './TransactionDialogContainer';
import type { GeneratedData as TransactionDialogData } from './TransactionDialogContainer';
import { ProgressStep, ProgressInfo } from '../../../../stores/ada/VotingStore';
import type { WalletType } from '../../../../components/wallet/voting/types';
import CreateTxExecutingDialog from '../../../../components/wallet/voting/CreateTxExecutingDialog'

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
    this.generated.actions.ada.votingActions.generatePlaceholderTransaction.trigger();
  }
  async componentWillUnmount() {
    this.generated.actions.ada.votingActions.cancel.trigger();
  }

  render(): null | Node {
    const votingStore = this.generated.stores.substores.ada.votingStore;
    if (votingStore.generateVotingRegTx.isExecuting) {
      return (<CreateTxExecutingDialog />);
    }

    const { profile } = this.generated.stores;
    const votingActions = this.generated.actions.ada.votingActions;
    const walletType = this.props.walletType;

    let component = null;

    switch (votingStore.progressInfo.currentStep) {
      case ProgressStep.TRANSACTION:
        component = (
          <TransactionDialogContainer
            {...this.generated.TransactionDialogProps}
            classicTheme={profile.isClassicTheme}
            cancel={this.cancel}
            submit={votingActions.submitTransaction.trigger}
            goBack={this.cancel}
            onError={votingActions.submitTransactionError.trigger}
            walletType={walletType}
          />);
        break;
      case ProgressStep.DONE:
        component = (
          <DoneDialog
            onExternalLinkClick={handleExternalLinkClick}
            submit={votingActions.finishDone.trigger}
            cancel={this.cancel}
            classicTheme={profile.isClassicTheme}
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
      ada: {|
        votingActions: {|
          cancel: {| trigger: (params: void) => void |},
          submitTransaction: {|
            trigger: (params: void) => void
          |},
          submitTransactionError: {|
            trigger: (params: Error) => void
          |},
          finishDone: {|
            trigger: (params: void) => void
          |},
          generatePlaceholderTransaction: {|
            trigger: (params: void) => Promise<void>
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
            progressInfo: ProgressInfo,
            isActionProcessing: boolean,
            generateVotingRegTx: {|
              isExecuting: boolean,
            |},
          |},
        |}
      |}
    |},
    TransactionDialogProps: InjectedOrGenerated<TransactionDialogData>,
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
              isActionProcessing: stores.substores.ada.votingStore.isActionProcessing,
              generateVotingRegTx: {
                isExecuting: stores.substores.ada.votingStore.generateVotingRegTx.isExecuting,
              },
            },
          },
        },
      },
      actions: {
        ada: {
          votingActions: {
            submitTransaction: {
              trigger: actions.ada.voting.submitTransaction.trigger,
            },
            submitTransactionError: {
              trigger: actions.ada.voting.submitTransactionError.trigger,
            },
            finishDone: {
              trigger: actions.ada.voting.finishDone.trigger,
            },
            cancel: {
              trigger: actions.ada.voting.cancel.trigger,
            },
            generatePlaceholderTransaction: {
              trigger: actions.ada.voting.generatePlaceholderTransaction.trigger,
            },
          },
        },
      },
      TransactionDialogProps:
        ({ actions, stores, }: InjectedOrGenerated<TransactionDialogData>),
    });
  }
}
