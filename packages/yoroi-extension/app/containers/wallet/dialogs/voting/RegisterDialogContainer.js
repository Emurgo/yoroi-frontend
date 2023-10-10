// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import type { StepsList } from '../../../../components/wallet/voting/types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape } from 'react-intl';
import { ProgressInfo } from '../../../../stores/ada/VotingStore';
import { withLayout } from '../../../../styles/context/layout';
import globalMessages from '../../../../i18n/global-messages';
import DialogCloseButton from '../../../../components/widgets/DialogCloseButton';
import Dialog from '../../../../components/widgets/Dialog';
import LocalizableError from '../../../../i18n/LocalizableError';
import ErrorBlock from '../../../../components/widgets/ErrorBlock';
import RegisterDialog from '../../../../components/wallet/voting/RegisterDialog';

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

type InjectedProps = {|
  +isRevampLayout: boolean,
|};

type AllProps = {| ...Props, ...InjectedProps |};

@observer
class RegisterDialogContainer extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { submit, cancel, onError, classicTheme, stepsList } = this.props;
    const votingStore = this.generated.stores.substores.ada.votingStore;

    if (votingStore.createVotingRegTx.error != null) {
      return this._errorDialog(votingStore.createVotingRegTx.error);
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
        isRevamp={this.props.isRevampLayout}
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
            createVotingRegTx: {|
              error: ?LocalizableError,
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
              createVotingRegTx: {
                error: stores.substores.ada.votingStore.createVotingRegTx.error,
              },
            },
          },
        },
      },
    });
  }
}

export default (withLayout(RegisterDialogContainer): ComponentType<Props>);
