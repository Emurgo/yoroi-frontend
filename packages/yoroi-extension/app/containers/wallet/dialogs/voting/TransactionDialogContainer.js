// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer, } from 'mobx-react';
import { computed, } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat, MessageDescriptor } from 'react-intl';
import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import VotingRegTxDialog from '../../../../components/wallet/voting/VotingRegTxDialog';
import LocalizableError from '../../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { CreateVotingRegTxFunc } from '../../../../api/ada/index';
import { ProgressInfo } from '../../../../stores/ada/VotingStore';
import type { TokenInfoMap } from '../../../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import type { WalletType } from '../../../../components/wallet/voting/types';

export type GeneratedData = typeof TransactionDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +stepsList: Array<MessageDescriptor>,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +goBack: void => void,
  +classicTheme: boolean,
  +onError: Error => void,
  +walletType: WalletType,
|};

@observer
export default class TransactionDialogContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { stepsList, submit, cancel, goBack, onError, walletType } = this.props;
    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      return null;
    }

    const { votingRegTransactionStore, votingStore } = this.generated.stores.substores.ada;
    const votingRegTx = votingRegTransactionStore.createVotingRegTx.result;

    if (votingRegTx != null) {
      return (
        <VotingRegTxDialog
          stepsList={stepsList}
          progressInfo={votingStore.progressInfo}
          staleTx={votingRegTransactionStore.isStale}
          transactionFee={votingRegTx.fee()}
          isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          onCancel={cancel}
          goBack={goBack}
          onSubmit={async ({ password }) => {
            try {
              await this.generated.actions.ada.votingTransaction.signTransaction.trigger({
                password,
                publicDeriver: selectedWallet,
              })
              await submit();
            } catch (error) {
              onError(error);
            }
            }
          }
          classicTheme={this.props.classicTheme}
          error={votingStore.error}
          walletType={walletType}
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
            error: ?LocalizableError,
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
          },
        },
        substores: {
          ada: {
            votingStore: {
              progressInfo: stores.substores.ada.votingStore.progressInfo,
              error: stores.substores.ada.votingStore.error,
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
