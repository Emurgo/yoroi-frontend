// @flow
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../../../../types/injectedProps.types';
import type { WalletType } from '../../../../components/wallet/voting/types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Logger } from '../../../../utils/logging';
import { handleExternalLinkClick } from '../../../../utils/routing';
import { ProgressStep } from '../../../../stores/ada/VotingStore';
import GeneratePinDialog from '../../../../components/wallet/voting/GeneratePinDialog';
import ConfirmPinDialog from '../../../../components/wallet/voting/ConfirmPinDialog';
import QrCodeDialog from '../../../../components/wallet/voting/QrCodeDialog';
import TransactionDialogContainer from './TransactionDialogContainer';
import RegisterDialogContainer from './RegisterDialogContainer';
import globalMessages from '../../../../i18n/global-messages';
import CreateTxExecutingDialog from '../../../../components/wallet/voting/CreateTxExecutingDialog';
import { noop } from '../../../../coreUtils';

type Props = {|
  +onClose: void => void,
  +walletType: WalletType,
|};

type AllProps = {| ...Props, ...StoresAndActionsProps |};

@observer
export default class VotingRegistrationDialogContainer extends Component<AllProps> {
  cancel: () => void = () => {
    this.props.onClose();
    this.props.stores.substores.ada.votingStore.cancel();
  };

  componentDidMount() {
    // <TODO:SUS> there should be a better way to trigger key generation then a component mount
    noop(this.props.stores.substores.ada.votingStore.generateCatalystKey());
  }
  async componentWillUnmount() {
    this.props.stores.substores.ada.votingStore.cancel();
  }

  render(): null | Node {
    const { actions, stores } = this.props;
    const votingStore = stores.substores.ada.votingStore;
    if (votingStore.createVotingRegTx.isExecuting) {
      return <CreateTxExecutingDialog />;
    }

    const walletType = this.props.walletType;
    const stepsList = [
      { step: ProgressStep.GENERATE, message: globalMessages.stepPin },
      { step: ProgressStep.CONFIRM, message: globalMessages.stepConfirm },
      ...(walletType === 'mnemonic'
        ? [{ step: ProgressStep.REGISTER, message: globalMessages.registerLabel }]
        : []),
      { step: ProgressStep.TRANSACTION, message: globalMessages.transactionLabel },
      { step: ProgressStep.QR_CODE, message: globalMessages.stepQrCode },
    ];

    let component = null;

    switch (votingStore.progressInfo.currentStep) {
      case ProgressStep.GENERATE:
        component = (
          <GeneratePinDialog
            stepsList={stepsList}
            progressInfo={votingStore.progressInfo}
            pin={votingStore.pin}
            next={votingStore.submitGenerate}
            cancel={this.cancel}
            onBack={this.props.onClose}
          />
        );
        break;
      case ProgressStep.CONFIRM:
        component = (
          <ConfirmPinDialog
            stepsList={stepsList}
            progressInfo={votingStore.progressInfo}
            goBack={votingStore.goBackToGenerate}
            submit={votingStore.submitConfirm}
            error={votingStore.submitConfirmError}
            cancel={this.cancel}
            pinValidation={enteredPin => {
              const pin = votingStore.pin.join('');
              return pin === enteredPin;
            }}
            isProcessing={votingStore.isActionProcessing}
          />
        );
        break;
      case ProgressStep.REGISTER:
        component = (
          <RegisterDialogContainer
            actions={actions}
            stores={stores}
            stepsList={stepsList}
            submit={votingStore.submitRegister}
            goBack={votingStore.goBackToRegister}
            cancel={this.cancel}
            onError={votingStore.submitRegisterError}
          />
        );
        break;
      case ProgressStep.TRANSACTION:
        component = (
          <TransactionDialogContainer
            actions={actions}
            stores={stores}
            stepsList={stepsList}
            cancel={this.cancel}
            submit={votingStore.submitTransaction}
            goBack={votingStore.goBackToRegister}
            onError={votingStore.submitTransactionError}
            walletType={walletType}
          />
        );
        break;
      case ProgressStep.QR_CODE:
        component = (
          <QrCodeDialog
            stepsList={stepsList}
            progressInfo={votingStore.progressInfo}
            onExternalLinkClick={handleExternalLinkClick}
            submit={votingStore.finishQRCode}
            cancel={this.cancel}
            votingKey={votingStore.encryptedKey}
          />
        );
        break;
      default:
        Logger.error(
          `${nameof(VotingRegistrationDialogContainer)}::${nameof(
            this.render
          )}: something unexpected happened`
        );
        break;
    }

    return component;
  }
}
