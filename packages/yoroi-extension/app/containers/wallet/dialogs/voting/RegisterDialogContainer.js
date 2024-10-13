// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../../../types/injectedProps.types';
import type { StepsList } from '../../../../components/wallet/voting/types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { withLayout } from '../../../../styles/context/layout';
import globalMessages from '../../../../i18n/global-messages';
import DialogCloseButton from '../../../../components/widgets/DialogCloseButton';
import Dialog from '../../../../components/widgets/Dialog';
import LocalizableError from '../../../../i18n/LocalizableError';
import ErrorBlock from '../../../../components/widgets/ErrorBlock';
import RegisterDialog from '../../../../components/wallet/voting/RegisterDialog';

type Props = {|
  ...StoresAndActionsProps,
  +stepsList: StepsList,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +goBack: void => void,
  +onError: Error => void,
|};

type InjectedLayoutProps = {|
  +isRevampLayout: boolean,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class RegisterDialogContainer extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { submit, cancel, onError, stepsList } = this.props;
    const votingStore = this.props.stores.substores.ada.votingStore;

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
            await this.props.actions.ada.voting.createTransaction.trigger(
              walletPassword
            );
            await submit();
          } catch (error) {
            onError(error);
          }
        }}
        isProcessing={votingStore.isActionProcessing}
        cancel={cancel}
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
}

export default (withLayout(RegisterDialogContainer): ComponentType<Props>);
