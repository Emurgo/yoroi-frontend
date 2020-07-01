// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction, } from 'mobx';
import UserPasswordDialog from '../../../components/wallet/add/paper-wallets/UserPasswordDialog';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
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
import type { WalletRestoreDialogValues } from '../../../components/wallet/WalletRestoreDialog';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { PdfGenStepType } from '../../../api/ada/paperWallet/paperWalletPdf';
import type { ProgressStepEnum } from '../../../stores/ada/PaperWalletCreateStore';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { Notification } from '../../../types/notificationType';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

const messages = defineMessages({
  verifyPaperWallet: {
    id: 'settings.paperWallet.dialog.verify.message',
    defaultMessage: '!!!Verify your paper wallet',
  },
});

export type GeneratedData = typeof CreatePaperWalletDialogContainer.prototype.generated;

@observer
export default class CreatePaperWalletDialogContainer
  extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  @observable notificationElementId: string = '';

  getSelectedNetwork: void => $ReadOnly<NetworkRow> = () => {
    const { selectedNetwork } = this.generated.stores.profile;
    if (selectedNetwork === undefined) {
      throw new Error(`${nameof(CreatePaperWalletDialogContainer)} no API selected`);
    }
    return selectedNetwork;
  }

  render(): null | Node {
    const { intl } = this.context;
    const { uiDialogs, uiNotifications, profile } = this.generated.stores;
    const { updateDataForActiveDialog } = this.generated.actions.dialogs;
    const dialogData = uiDialogs.dataForActiveDialog;

    const getPaperFromStore = (): AdaPaper => {
      const paper = this.generated.stores.paperWallets.paper;
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
      this.generated.actions.dialogs.closeActiveDialog.trigger();
      this.generated.actions.paperWallets.cancel.trigger();
    };

    if (this.generated.stores.paperWallets.progressInfo === ProgressStep.INIT) {
      this.generated.actions.paperWallets.submitInit.trigger({
        numAddresses: dialogData.numAddresses,
        printAccountPlate: dialogData.printAccountPlate,
      });
    }

    switch (this.generated.stores.paperWallets.progressInfo) {
      case ProgressStep.USER_PASSWORD:
        return (
          <UserPasswordDialog
            dialogData={{
              passwordValue: dialogData.passwordValue,
              repeatedPasswordValue: dialogData.repeatedPasswordValue,
            }}
            onNext={this.generated.actions.paperWallets.submitUserPassword.trigger}
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
            renderStatus={this.generated.stores.paperWallets.pdfRenderStatus}
            paperFile={this.generated.stores.paperWallets.pdf}
            onNext={this.generated.actions.paperWallets.submitCreate.trigger}
            onCancel={onCancel}
            loadingGif={<LoadingGif />}
            onDownload={this.generated.actions.paperWallets.downloadPaperWallet.trigger}
            onDataChange={data => {
              updateDataForActiveDialog.trigger({ data });
            }}
          />
        );
      case ProgressStep.VERIFY:
        return (
          <WalletRestoreDialog
            onSubmit={_data => this.generated.actions.paperWallets.submitVerify.trigger()}
            onCancel={onCancel}
            onBack={this.generated.actions.paperWallets.backToCreate.trigger}
            numberOfMnemonics={config.wallets.YOROI_PAPER_RECOVERY_PHRASE_WORD_COUNT}
            mnemonicValidator={words => (
              this.generated.stores.paperWallets.paper != null &&
                words === this.generated.stores.paperWallets.paper.scrambledWords.join(' ')
            )}
            paperPasswordValidator={
              pass => pass === this.generated.stores.paperWallets.userPassword
            }
            validWords={validWords}
            initValues={this.generated.verifyDefaultValues}
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
            selectedExplorer={this.generated.stores.explorers.selectedExplorer
              .get(this.getSelectedNetwork().NetworkId) ?? (() => { throw new Error('No explorer for wallet network'); })()
            }
            onNext={onCancel}
            onCancel={onCancel}
            onBack={this.generated.actions.paperWallets.backToCreate.trigger}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                this.generated.actions.notifications.open.trigger({
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

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        updateDataForActiveDialog: {|
          trigger: (params: {
            [key: string]: any,
            ...
          }) => void
        |}
      |},
      notifications: {|
        open: {| trigger: (params: Notification) => void |}
      |},
      paperWallets: {|
        backToCreate: {| trigger: (params: void) => void |},
        cancel: {| trigger: (params: void) => void |},
        downloadPaperWallet: {|
          trigger: (params: void) => void
        |},
        submitCreate: {| trigger: (params: void) => void |},
        submitInit: {|
          trigger: (params: {|
            numAddresses: number,
            printAccountPlate: boolean
          |}) => void
        |},
        submitUserPassword: {|
          trigger: (params: {|
            userPassword: string
          |}) => Promise<void>
        |},
        submitVerify: {| trigger: (params: void) => void |}
      |}
    |},
    stores: {|
      paperWallets: {|
        paper: ?AdaPaper,
        pdf: ?Blob,
        pdfRenderStatus: ?PdfGenStepType,
        progressInfo: ?ProgressStepEnum,
        userPassword: ?string
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        paperWalletsIntro: string,
        selectedNetwork: void | $ReadOnly<NetworkRow>,
      |},
      uiDialogs: {|
        dataForActiveDialog: {|
          numAddresses: any,
          passwordValue: any,
          printAccountPlate: any,
          repeatedPasswordValue: any
        |}
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean
      |}
    |},
    verifyDefaultValues: ?WalletRestoreDialogValues
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(CreatePaperWalletDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          paperWalletsIntro: stores.profile.paperWalletsIntro,
          isClassicTheme: stores.profile.isClassicTheme,
          selectedNetwork: stores.profile.selectedNetwork,
        },
        uiDialogs: {
          dataForActiveDialog: {
            numAddresses: stores.uiDialogs.dataForActiveDialog.numAddresses,
            printAccountPlate: stores.uiDialogs.dataForActiveDialog.printAccountPlate,
            repeatedPasswordValue: stores.uiDialogs.dataForActiveDialog.repeatedPasswordValue,
            passwordValue: stores.uiDialogs.dataForActiveDialog.passwordValue,
          }
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        paperWallets: {
          paper: stores.substores.ada.paperWallets.paper,
          progressInfo: stores.substores.ada.paperWallets.progressInfo,
          userPassword: stores.substores.ada.paperWallets.userPassword,
          pdfRenderStatus: stores.substores.ada.paperWallets.pdfRenderStatus,
          pdf: stores.substores.ada.paperWallets.pdf,
        },
      },
      actions: {
        dialogs: {
          updateDataForActiveDialog: { trigger: actions.dialogs.updateDataForActiveDialog.trigger },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
        notifications: {
          open: { trigger: actions.notifications.open.trigger },
        },
        paperWallets: {
          cancel: { trigger: actions.ada.paperWallets.cancel.trigger },
          submitInit: { trigger: actions.ada.paperWallets.submitInit.trigger },
          submitUserPassword: { trigger: actions.ada.paperWallets.submitUserPassword.trigger },
          backToCreate: { trigger: actions.ada.paperWallets.backToCreate.trigger },
          submitVerify: { trigger: actions.ada.paperWallets.submitVerify.trigger },
          submitCreate: { trigger: actions.ada.paperWallets.submitCreate.trigger },
          downloadPaperWallet: { trigger: actions.ada.paperWallets.downloadPaperWallet.trigger },
        },
      },
      verifyDefaultValues: (undefined: ?WalletRestoreDialogValues),
    });
  }
}
