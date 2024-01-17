// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction, } from 'mobx';
import UserPasswordDialog from '../../../components/wallet/add/paper-wallets/UserPasswordDialog';
import type { InjectedProps } from '../../../types/injectedPropsType';
import config from '../../../config';
import { ProgressStep } from '../../../stores/ada/PaperWalletCreateStore';
import { Logger } from '../../../utils/logging';
import CreatePaperDialog from '../../../components/wallet/add/paper-wallets/CreatePaperDialog';
import LoadingGif from '../../../components/wallet/add/paper-wallets/LoadingGif';
import WalletRestoreDialog from '../../../components/wallet/WalletRestoreDialog';
import validWords from 'bip39/src/wordlists/english.json';
import FinalizeDialog from '../../../components/wallet/add/paper-wallets/FinalizeDialog';
import type { AdaPaper } from '../../../api/ada';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

const messages = defineMessages({
  verifyPaperWallet: {
    id: 'settings.paperWallet.dialog.verify.message',
    defaultMessage: '!!!Verify your paper wallet',
  },
});

@observer
export default class CreatePaperWalletDialogContainer
  extends Component<InjectedProps> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  @observable notificationElementId: string = '';

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.props.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(CreatePaperWalletDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  }

  render(): null | Node {
    const { intl } = this.context;
    const { uiDialogs, uiNotifications, profile } = this.props.stores;
    const { updateDataForActiveDialog } = this.props.actions.dialogs;

    const paperWalletsStore = this.props.stores.substores.ada.paperWallets;
    const paperWalletsActions = this.props.actions.ada.paperWallets;

    const getPaperFromStore = (): AdaPaper => {
      const paper = paperWalletsStore.paper;
      if (!paper) {
        throw new Error('Internal error! Paper instance is not available when should be.');
      }
      return paper;
    };

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const onCancel = () => {
      this.props.actions.dialogs.closeActiveDialog.trigger();
      paperWalletsActions.cancel.trigger();
    };

    if (paperWalletsStore.progressInfo === ProgressStep.INIT) {
      paperWalletsActions.submitInit.trigger({
        numAddresses: uiDialogs.getActiveData<number>('numAddresses') || 0,
        printAccountPlate: uiDialogs.getActiveData<boolean>('printAccountPlate') || true,
      });
    }

    switch (paperWalletsStore.progressInfo) {
      case ProgressStep.USER_PASSWORD:
        return (
          <UserPasswordDialog
            dialogData={{
              passwordValue: uiDialogs.getActiveData<string>('passwordValue') || '',
              repeatedPasswordValue: uiDialogs.getActiveData<string>('repeatedPasswordValue') || '',
            }}
            onNext={paperWalletsActions.submitUserPassword.trigger}
            onCancel={onCancel}
            onDataChange={data => {
              updateDataForActiveDialog.trigger(data);
            }}
            classicTheme={profile.isClassicTheme}
          />
        );
      case ProgressStep.CREATE:
        return (
          <CreatePaperDialog
            renderStatus={paperWalletsStore.pdfRenderStatus}
            paperFile={paperWalletsStore.pdf}
            onNext={paperWalletsActions.submitCreate.trigger}
            onCancel={onCancel}
            loadingGif={<LoadingGif />}
            onDownload={paperWalletsActions.downloadPaperWallet.trigger}
          />
        );
      case ProgressStep.VERIFY:
        return (
          <WalletRestoreDialog
            onSubmit={_data => paperWalletsActions.submitVerify.trigger()}
            onCancel={onCancel}
            onBack={paperWalletsActions.backToCreate.trigger}
            numberOfMnemonics={config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT}
            mnemonicValidator={words => (
              paperWalletsStore.paper != null &&
                words === paperWalletsStore.paper.scrambledWords.join(' ')
            )}
            paperPasswordValidator={
              pass => pass === paperWalletsStore.userPassword
            }
            validWords={validWords}
            initValues={undefined}
            isPaper
            showPaperPassword
            isVerificationMode
            classicTheme={profile.isClassicTheme}
            introMessage={intl.formatMessage(messages.verifyPaperWallet)}
          />
        );
      case ProgressStep.FINALIZE:
        return (
          <FinalizeDialog
            paper={getPaperFromStore()}
            selectedExplorer={this.props.stores.explorers.selectedExplorer
              .get(this.getSelectedNetwork().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
            }
            onNext={onCancel}
            onCancel={onCancel}
            onBack={paperWalletsActions.backToCreate.trigger}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                this.props.actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={uiNotifications.getTooltipActiveNotification(
              this.notificationElementId
            )}
          />
        );
      default:
        Logger.error('CreatePaperWalletDialogContainer::render: something unexpected happened');
        return null;
    }
  }
}
