// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import WalletSendForm from '../../components/wallet/send/WalletSendForm';
// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import type {
  GeneratedData as WalletSendConfirmationDialogContainerData
} from './dialogs/WalletSendConfirmationDialogContainer';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { SendUsingLedgerParams } from '../../actions/ada/ledger-send-actions';
import type { SendUsingTrezorParams } from '../../actions/ada/trezor-send-actions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { UriParams } from '../../utils/URIHandling';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import LocalizableError from '../../i18n/LocalizableError';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import { ApiOptions, getApiForNetwork, } from '../../api/common/utils';
import { validateAmount, getMinimumValue } from '../../utils/validations';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { genFormatTokenAmount, genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import TransactionSuccessDialog from '../../components/wallet/send/TransactionSuccessDialog';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';
import globalMessages from '../../i18n/global-messages';
import AssetsList from '../../components/wallet/assets/AssetsList';
import { truncateToken } from '../../utils/formatters';

const messages = defineMessages({
  txConfirmationLedgerNanoLine1: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Send using Ledger button.',
  },
  sendUsingLedgerNano: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
  },
  txConfirmationTrezorTLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
  },
  sendUsingTrezorT: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
  },
});

export type GeneratedData = typeof WalletAssetsPage.prototype.generated;

@observer
export default class WalletAssetsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletAssetsPage)}.`);

    const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );
    const spendableBalance = this.generated.stores.transactions.getBalanceRequest.result
    const getTokenInfo= genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)

    const assetsList = (() => {
        if (spendableBalance == null) return [];
        return [
          ...spendableBalance.nonDefaultEntries(),
        ].map(entry => ({
          entry,
          info: getTokenInfo(entry),
        })).map(token => ({
          value: token.info.TokenId,
          info: token.info,
          label: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
          id: (getTokenIdentifierIfExists(token.info) ?? '-'),
          amount: genFormatTokenAmount(getTokenInfo)(token.entry)
        }));
      })();
  
  
    return (
      <>
       <AssetsList
        onClick={() => {}}
        assetsList={assetsList}
       />
      </>
    );
  }

  @computed get generated(): {|
    WalletSendConfirmationDialogContainerProps:
      InjectedOrGenerated<WalletSendConfirmationDialogContainerData>,
    actions: {|
      ada: {|
        ledgerSend: {|
          cancel: {| trigger: (params: void) => void |},
          init: {| trigger: (params: void) => void |},
          sendUsingLedgerWallet: {|
            trigger: (params: {|
              params: SendUsingLedgerParams,
              publicDeriver: PublicDeriver<>,
              onSuccess?: void => void,
            |}) => Promise<void>
          |}
        |},
        trezorSend: {|
          cancel: {| trigger: (params: void) => void |},
          sendUsingTrezor: {|
            trigger: (params: {|
              params: SendUsingTrezorParams,
              publicDeriver: PublicDeriver<>,
              onSuccess?: void => void,
            |}) => Promise<void>
          |}
        |},
      |},
      txBuilderActions: {|
        reset: {|
          trigger: (params: void) => void
        |},
        updateSendAllStatus: {|
          trigger: (params: boolean | void) => void
        |},
        updateAmount: {|
          trigger: (params: ?BigNumber) => void
        |},
        updateToken: {|
          trigger: (params: void | $ReadOnly<TokenRow>) => void
        |},
        updateMemo: {|
          trigger: (params: void | string) => void
        |},
        updateReceiver: {|
          trigger: (params: void | string) => void
        |},
        updateTentativeTx: {|
          trigger: (params: void) => void
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        push: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |},
      |},
      memos: {|
        closeMemoDialog: {| trigger: (params: void) => void |}
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |}
    |},
    initialShowMemoState: boolean,
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      loading: {|
        resetUriParams: void => void,
        uriParams: ?UriParams
      |},
      memos: {|
        hasSetSelectedExternalStorageProvider: boolean
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
      transactionBuilderStore: {|
        createUnsignedTx: {|
          error: ?LocalizableError,
          isExecuting: boolean
        |},
        fee: ?MultiToken,
        shouldSendAll: boolean,
        tentativeTx: null | ISignRequest<any>,
        totalInput: ?MultiToken,
        txMismatch: boolean,
        selectedToken: void | $ReadOnly<TokenRow>,
      |},
      substores: {|
        ada: {|
          ledgerSend: {|
            error: ?LocalizableError,
            isActionProcessing: boolean
          |},
          trezorSend: {|
            error: ?LocalizableError,
            isActionProcessing: boolean
          |}
        |}
      |},
      transactions: {|
        hasAnyPending: boolean,
        getBalanceRequest: {|
          result: ?MultiToken,
        |},
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean
      |},
      wallets: {| selected: null | PublicDeriver<> |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletAssetsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStore = stores.substores.ada;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        memos: {
          hasSetSelectedExternalStorageProvider: stores.memos.hasSetSelectedExternalStorageProvider,
        },
        loading: {
          uriParams: stores.loading.uriParams,
          resetUriParams: stores.loading.resetUriParams,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        transactions: {
          hasAnyPending: stores.transactions.hasAnyPending,
          getBalanceRequest: (() => {
            if (stores.wallets.selected == null) return {
              result: undefined,
            };
            const { requests } = stores.transactions.getTxRequests(stores.wallets.selected);

            return {
              result: requests.getBalanceRequest.result,
            };
          })(),
        },
        transactionBuilderStore: {
          totalInput: stores.transactionBuilderStore.totalInput,
          fee: stores.transactionBuilderStore.fee,
          shouldSendAll: stores.transactionBuilderStore.shouldSendAll,
          tentativeTx: stores.transactionBuilderStore.tentativeTx,
          txMismatch: stores.transactionBuilderStore.txMismatch,
          createUnsignedTx: {
            isExecuting: stores.transactionBuilderStore.createUnsignedTx.isExecuting,
            error: stores.transactionBuilderStore.createUnsignedTx.error,
          },
          selectedToken: stores.transactionBuilderStore.selectedToken,
        },
        substores: {
          ada: {
            ledgerSend: {
              isActionProcessing: adaStore.ledgerSend.isActionProcessing,
              error: adaStore.ledgerSend.error,
            },
            trezorSend: {
              isActionProcessing: adaStore.trezorSend.isActionProcessing,
              error: adaStore.trezorSend.error,
            },
          },
        },
      },
      actions: {
        dialogs: {
          push: {
            trigger: actions.dialogs.push.trigger,
          },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        memos: {
          closeMemoDialog: {
            trigger: actions.memos.closeMemoDialog.trigger
          },
        },
        txBuilderActions: {
          updateTentativeTx: { trigger: actions.txBuilderActions.updateTentativeTx.trigger },
          updateReceiver: { trigger: actions.txBuilderActions.updateReceiver.trigger },
          updateAmount: { trigger: actions.txBuilderActions.updateAmount.trigger },
          updateToken: { trigger: actions.txBuilderActions.updateToken.trigger },
          updateSendAllStatus: { trigger: actions.txBuilderActions.updateSendAllStatus.trigger },
          reset: { trigger: actions.txBuilderActions.reset.trigger },
          updateMemo: { trigger: actions.txBuilderActions.updateMemo.trigger },
        },
        ada: {
          ledgerSend: {
            init: { trigger: actions.ada.ledgerSend.init.trigger },
            cancel: { trigger: actions.ada.ledgerSend.cancel.trigger },
            sendUsingLedgerWallet: {
              trigger: actions.ada.ledgerSend.sendUsingLedgerWallet.trigger
            },
          },
          trezorSend: {
            cancel: { trigger: actions.ada.trezorSend.cancel.trigger },
            sendUsingTrezor: { trigger: actions.ada.trezorSend.sendUsingTrezor.trigger },
          },
        },
      },
      initialShowMemoState: (false: boolean),
      WalletSendConfirmationDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletSendConfirmationDialogContainerData>
      ),
    });
  }
}
