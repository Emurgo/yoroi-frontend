// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer, } from 'mobx-react';
import { computed, } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import VotingRegTxDialog from '../../../../components/wallet/voting/VotingRegTxDialog';
import { WalletTypeOption } from '../../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import LocalizableError from '../../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { CreateVotingRegTxFunc } from '../../../../api/ada/index';
import { ProgressInfo } from '../../../../stores/ada/VotingStore';
import type { TokenInfoMap } from '../../../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';

export type GeneratedData = typeof TransactionDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +goBack: void => void,
  +classicTheme: boolean,
|};

@observer
export default class TransactionDialogContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { submit, cancel, goBack } = this.props;
    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    const { votingRegTransactionStore, votingStore } = this.generated.stores.substores.ada;
    const votingRegTx = votingRegTransactionStore.createVotingRegTx.result;

    if (votingRegTx != null) {
      return (
        <VotingRegTxDialog
          progressInfo={votingStore.progressInfo}
          staleTx={votingRegTransactionStore.isStale}
          transactionFee={votingRegTx.fee()}
          isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
          isHardware={
            selectedWallet.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET
          }
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          onCancel={cancel}
          goBack={goBack}
          onSubmit={async ({ password }) => {
              await this.generated.actions.ada.votingTransaction.signTransaction.trigger({
                password,
                publicDeriver: selectedWallet,
              })
              submit();
            }
          }
          classicTheme={this.props.classicTheme}
          error={this.generated.stores.wallets.sendMoneyRequest.error}
        />
      );
    }
    return null;
  }

  @computed get generated(): {|
    actions: {|
      ada: {|
        votingTransaction: {|
          signTransaction: {|
            trigger: (params: {|
              password?: string,
              publicDeriver: PublicDeriver<>,
            |}) => Promise<void>,
          |},
        |},
      |},
    |},
    stores: {|
      substores: {|
        ada: {|
          votingStore: {|
            progressInfo: ProgressInfo,
          |},
          votingRegTransactionStore: {|
            createVotingRegTx: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              result: ?PromisslessReturnType<CreateVotingRegTxFunc>,
            |},
            isStale: boolean,
          |},
        |},
      |},
      wallets: {|
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          wasExecuted: boolean,
        |},
        selected: null | PublicDeriver<>,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(TransactionDialogContainer)} no way to generated props`);
    }

    const { stores, actions } = this.props;
    const votingStore = stores.substores.ada.votingStore;
    return Object.freeze({
      actions: {
        ada: {
          votingTransaction: {
            signTransaction: {
              trigger: actions.ada.voting.signTransaction.trigger,
            },
          },
        },
      },
      stores: {
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
            wasExecuted: stores.wallets.sendMoneyRequest.wasExecuted,
          },
        },
        substores: {
          ada: {
            votingStore: {
              progressInfo: stores.substores.ada.votingStore.progressInfo,
            },
            votingRegTransactionStore: {
              isStale: votingStore.isStale,
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
