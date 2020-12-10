// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, action } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import QRCode from 'qrcode.react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import classnames from 'classnames';
import globalMessages from '../../i18n/global-messages';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import Dialog from '../../components/widgets/Dialog';
import DialogCloseButton from '../../components/widgets/DialogCloseButton';
import ErrorBlock from '../../components/widgets/ErrorBlock';
import AnnotatedLoader from '../../components/transfer/AnnotatedLoader';
import type { CreateVotingRegTxFunc } from '../../api/ada/index';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import LocalizableError from '../../i18n/LocalizableError';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import VotingRegTxDialog from '../../components/wallet/voting/VotingRegTxDialog';
import VotingRegSuccessDialog from '../../components/wallet/voting/VotingRegSuccessDialog';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';

import SpendingPasswordInput from '../../components/widgets/forms/SpendingPasswordInput';
import ReactToolboxMobxForm from '../../utils/ReactToolboxMobxForm';

export type GeneratedData = typeof VotingPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};

@observer
export default class VotingPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  cancel: void => void = () => {
    this.generated.actions.ada.votingTransaction.reset.trigger({ justTransaction: true });
  };

  async componentWillUnmount() {
    this.generated.actions.ada.votingTransaction.reset.trigger({ justTransaction: false });
  }

  componentDidMount() {
    this.generated.actions.generateCatalystKey.trigger();
  }
  render(): Node {
    const qrCodeBackgroundColor = document.documentElement
      ? document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color')
      : 'transparent';
    const qrCodeForegroundColor = document.documentElement
      ? document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color')
      : '#000';

    const buttonClasses = classnames([
      'primary',
      // styles.nextButton,
    ]);
    const { intl } = this.context;
    return (
      <div>
        {this.getDialog()}
        <SpendingPasswordInput
          classicTheme={false}
          setForm={form => this.setSpendingPasswordForm(form)}
          isSubmitting={false}
        />
        <Button
          className={buttonClasses}
          label={intl.formatMessage(globalMessages.nextButtonLabel)}
          onMouseUp={this._vote}
          skin={ButtonSkin}
        />
        <div>
          {this.generated.stores.voting.encryptedKey !== null ? (
            <QRCode
              value={this.generated.stores.voting.encryptedKey}
              bgColor={qrCodeBackgroundColor}
              fgColor={qrCodeForegroundColor}
              size={152}
            />
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }

  getDialog: void => void | Node = () => {
    const { intl } = this.context;
    const { votingRegTransaction } = this.generated.stores.substores.ada;
    const votingRegTx = votingRegTransaction.createVotingRegTx.result;

    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    const showSignDialog =
      this.generated.stores.wallets.sendMoneyRequest.isExecuting ||
      !this.generated.stores.wallets.sendMoneyRequest.wasExecuted ||
      this.generated.stores.wallets.sendMoneyRequest.error != null;

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
    if (votingRegTx != null && showSignDialog) {
      return (
        <VotingRegTxDialog
          staleTx={votingRegTransaction.isStale}
          transactionFee={votingRegTx.fee()}
          isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
          isHardware={
            selectedWallet.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET
          }
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          onCancel={this.cancel}
          onSubmit={({ password }) =>
            this.generated.actions.ada.votingTransaction.signTransaction.trigger({
              password,
              publicDeriver: selectedWallet,
            })
          }
          classicTheme={this.generated.stores.profile.isClassicTheme}
          error={this.generated.stores.wallets.sendMoneyRequest.error}
        />
      );
    }
    if (votingRegTx != null && !showSignDialog) {
      return (
        <VotingRegSuccessDialog
          onClose={this.generated.actions.ada.votingTransaction.complete.trigger}
          classicTheme={this.generated.stores.profile.isClassicTheme}
        />
      );
    }
    return undefined;
  };

  _errorDialog: LocalizableError => Node = error => {
    const { intl } = this.context;
    const dialogBackButton = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        onClick: this.cancel,
        primary: true,
      },
    ];
    return (
      <Dialog
        title={intl.formatMessage(globalMessages.errorLabel)}
        closeOnOverlayClick={false}
        onClose={this.cancel}
        closeButton={<DialogCloseButton onClose={this.cancel} />}
        actions={dialogBackButton}
      >
        <>
          <ErrorBlock error={error} />
        </>
      </Dialog>
    );
  };

  _vote: void => Promise<void> = async () => {
    if (this.spendingPasswordForm !== undefined) {
      this.spendingPasswordForm.submit({
        onSuccess: async form => {
          const { walletPassword } = form.values();
          await this.generated.actions.ada.votingTransaction.createTransaction.trigger(
            walletPassword
          );
        },
        onError: () => {},
      });
    }
  };

  @computed get generated(): {|
    actions: {|
      generateCatalystKey: {| trigger: (params: void) => Promise<void> |},
      ada: {|
        votingTransaction: {|
          complete: {|
            trigger: void => void,
          |},
          createTransaction: {|
            trigger: (params: string) => Promise<void>,
          |},
          reset: {| trigger: (params: {| justTransaction: boolean |}) => void |},
          signTransaction: {|
            trigger: (params: {|
              password?: string,
              publicDeriver: PublicDeriver<>,
            |}) => Promise<void>,
          |},
        |},
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      transactions: {| hasAnyPending: boolean |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      voting: {|
        encryptedKey: ?string,
      |},
      profile: {|
        isClassicTheme: boolean,
        currentLocale: string,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      substores: {|
        ada: {|
          votingRegTransaction: {|
            createVotingRegTx: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              result: ?PromisslessReturnType<CreateVotingRegTxFunc>,
            |},
            isStale: boolean,
          |},
        |},
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean,
      |},
      wallets: {|
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          wasExecuted: boolean,
        |},
        selected: null | PublicDeriver<>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(VotingPage)} no way to generated props`);
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
            signTransaction: {
              trigger: actions.ada.voting.signTransaction.trigger,
            },
            reset: {
              trigger: actions.ada.voting.reset.trigger,
            },
            complete: {
              trigger: actions.ada.voting.complete.trigger,
            },
          },
        },
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
        generateCatalystKey: { trigger: actions.ada.voting.generateCatalystKey.trigger },
      },
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
            wasExecuted: stores.wallets.sendMoneyRequest.wasExecuted,
          },
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          currentLocale: stores.profile.currentLocale,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        transactions: {
          hasAnyPending: stores.transactions.hasAnyPending,
        },
        substores: {
          ada: {
            votingRegTransaction: {
              isStale: votingStore.isStale,
              createVotingRegTx: {
                result: votingStore.createVotingRegTx.result,
                error: votingStore.createVotingRegTx.error,
                isExecuting: votingStore.createVotingRegTx.isExecuting,
              },
            },
          },
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        voting: {
          encryptedKey: votingStore.encryptedKey,
        },
      },
    });
  }
}
