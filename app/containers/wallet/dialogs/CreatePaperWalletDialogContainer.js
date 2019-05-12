// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import UserPasswordDialog from '../../../components/wallet/settings/paper-wallets/UserPasswordDialog';
import type { InjectedProps } from '../../../types/injectedPropsType';
import environment from '../../../environment';
import PaperWalletsActions from '../../../actions/ada/paper-wallets-actions';
import PaperWalletCreateStore, { ProgressStep } from '../../../stores/ada/PaperWalletCreateStore';
import { Logger } from '../../../utils/logging';
import CreatePaperDialog from '../../../components/wallet/settings/paper-wallets/CreatePaperDialog';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import validWords from 'bip39/src/wordlists/english.json';
import FinalizeDialog from '../../../components/wallet/settings/paper-wallets/FinalizeDialog';
import type { AdaPaper } from '../../../api/ada';

@observer
export default class CreatePaperWalletDialogContainer extends Component<InjectedProps> {

  render() {
    const { actions } = this.props;
    const { uiDialogs, profile } = this.props.stores;
    const { updateDataForActiveDialog } = actions.dialogs;
    const dialogData = uiDialogs.dataForActiveDialog;

    const paperStore = this._getStore();
    const paperActions = this._getActions();

    const getPaperFromStore = (): AdaPaper => {
      const paper = paperStore.paper;
      if (!paper) {
        throw new Error('Internal error! Paper instance is not available when should be.');
      }
      return paper;
    };

    const onCancel = () => {
      actions.dialogs.closeActiveDialog.trigger();
      paperActions.cancel.trigger({});
    };

    if (paperStore.progressInfo === ProgressStep.INIT) {
      paperActions.submitInit.trigger({
        numAddresses: dialogData.numAddresses,
        printAccountPlate: dialogData.printAccountPlate,
      });
    }

    switch (paperStore.progressInfo) {
      case ProgressStep.USER_PASSWORD:
        return (
          <UserPasswordDialog
            passwordValue={dialogData.passwordValue}
            repeatedPasswordValue={dialogData.repeatedPasswordValue}
            onNext={paperActions.submitUserPassword.trigger}
            onCancel={onCancel}
            onDataChange={data => {
              updateDataForActiveDialog.trigger({ data });
            }}
            classicTheme={profile.isClassicTheme}
          />
        );
      case ProgressStep.CREATE:
        return (
          <CreatePaperDialog
            renderStatus={paperStore.pdfRenderStatus}
            paperFile={paperStore.pdf}
            onNext={paperActions.submitCreate.trigger}
            onCancel={onCancel}
            onDownload={paperActions.downloadPaperWallet.trigger}
            onDataChange={data => {
              updateDataForActiveDialog.trigger({ data });
            }}
            classicTheme={profile.isClassicTheme}
          />
        );
      case ProgressStep.VERIFY:
        return (
          <WalletRestoreDialog
            onSubmit={paperActions.submitVerify.trigger}
            onCancel={onCancel}
            onBack={paperActions.backToCreate.trigger}
            numberOfMnemonics={21}
            mnemonicValidator={words => paperStore.paper && words === paperStore.paper.scrambledWords.join(' ')}
            passwordValidator={pass => pass === paperStore.userPassword}
            isSubmitting={false}
            validWords={validWords}
            isPaper
            showPaperPassword
            isVerificationMode
            classicTheme={profile.isClassicTheme}
          />
        );
      case ProgressStep.FINALIZE:
        return (
          <FinalizeDialog
            paper={getPaperFromStore()}
            onNext={onCancel}
            onCancel={onCancel}
            onBack={paperActions.backToCreate.trigger}
            classicTheme={profile.isClassicTheme}
          />
        );
      default:
        Logger.error('CreatePaperWalletDialogContainer::render: something unexpected happened');
        return null;
    }
  }

  _getActions = (): PaperWalletsActions => (
    this.props.actions[environment.API].paperWallets
  );

  _getStore = (): PaperWalletCreateStore => (
    this.props.stores.substores[environment.API].paperWallets
  );
}
