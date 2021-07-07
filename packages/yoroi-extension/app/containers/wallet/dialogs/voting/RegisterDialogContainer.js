// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import AnnotatedLoader from '../../../../components/transfer/AnnotatedLoader';
import DialogCloseButton from '../../../../components/widgets/DialogCloseButton';
import Dialog from '../../../../components/widgets/Dialog';
import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import LocalizableError from '../../../../i18n/LocalizableError';
import ErrorBlock from '../../../../components/widgets/ErrorBlock';
import type { CreateVotingRegTxFunc } from '../../../../api/ada/index';
import { ProgressInfo } from '../../../../stores/ada/VotingStore';
import RegisterDialog from '../../../../components/wallet/voting/RegisterDialog';
import type { StepsList } from '../../../../components/wallet/voting/types';

export type GeneratedData = typeof RegisterDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +stepsList: StepsList,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +goBack: void => void,
  +onError: Error => void,
  +classicTheme: boolean,
|};

@observer
export default class RegisterDialogContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { submit, cancel, onError, classicTheme, stepsList } = this.props;
    const { votingRegTransaction } = this.generated.stores.substores.ada;
    const votingStore = this.generated.stores.substores.ada.votingStore;

    if (votingRegTransaction.createVotingRegTx.isExecuting) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <AnnotatedLoader
            title={intl.formatMessage(globalMessages.processingLabel)}
            details={intl.formatMessage(globalMessages.txGeneration)}
          />
        </Dialog>
      );
    }

    if (votingRegTransaction.createVotingRegTx.error != null) {
      return this._errorDialog(votingRegTransaction.createVotingRegTx.error);
    }
    if (votingStore.error != null) {
      return this._errorDialog(votingStore.error);
    }
    return (
      <RegisterDialog
        stepsList={stepsList}
        progressInfo={votingStore.progressInfo}
        submit={async (walletPassword: string) => {
          try {
            await this.generated.actions.ada.votingTransaction.createTransaction.trigger(
              walletPassword
              );
            await submit();
          } catch (error) {
            onError(error);
          }
        }}
        isProcessing={votingStore.isActionProcessing}
        cancel={cancel}
        classicTheme={classicTheme}
      />
    );
  }

  _errorDialog: LocalizableError => Node = error => {
    const { intl } = this.context;
    const dialogBackButton = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.props.goBack,
        primary: true,
      },
    ];
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.errorLabel)}
        closeOnOverlayClick={false}
        onClose={this.props.cancel}
        closeButton={<DialogCloseButton onClose={this.props.cancel} />}
        actions={dialogBackButton}
      >
        <>
          <ErrorBlock error={error} />
        </>
      </Dialog>
    );
  };

  @computed get generated(): {|
    actions: {|
      ada: {|
        votingTransaction: {|
          createTransaction: {|
            trigger: (params: string) => Promise<void>,
          |},
        |},
      |},
    |},
    stores: {|
      substores: {|
        ada: {|
          votingStore: {|
            isActionProcessing: boolean,
            progressInfo: ProgressInfo,
            error: ?LocalizableError,
          |},
          votingRegTransaction: {|
            createVotingRegTx: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              result: ?PromisslessReturnType<CreateVotingRegTxFunc>,
            |},
          |},
        |},
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(RegisterDialogContainer)} no way to generated props`);
    }

    const { stores, actions } = this.props;
    const votingStore = stores.substores.ada.votingStore;
    return Object.freeze({
      actions: {
        ada: {
          votingTransaction: {
            createTransaction: {
              trigger: actions.ada.voting.createTransaction.trigger,
            },
          },
        },
      },
      stores: {
        substores: {
          ada: {
            votingStore: {
              isActionProcessing: stores.substores.ada.votingStore.isActionProcessing,
              progressInfo: stores.substores.ada.votingStore.progressInfo,
              error: stores.substores.ada.votingStore.error,
            },
            votingRegTransaction: {
              createVotingRegTx: {
                result: votingStore.createVotingRegTx.result,
                error: votingStore.createVotingRegTx.error,
                isExecuting: votingStore.createVotingRegTx.isExecuting,
              },
            },
          },
        },
      },
    });
  }
}
