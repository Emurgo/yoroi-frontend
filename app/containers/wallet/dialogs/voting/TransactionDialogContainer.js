// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer, } from 'mobx-react';
import { computed, } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { getApiForNetwork, getApiMeta } from '../../../../api/common/utils';
import type { InjectedOrGenerated } from '../../../../types/injectedPropsType';
import VotingRegTxDialog from '../../../../components/wallet/voting/VotingRegTxDialog';
import { WalletTypeOption } from '../../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import LocalizableError from '../../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { CreateVotingRegTxFunc } from '../../../../api/ada/index';
import { ProgressInfo } from '../../../../stores/ada/VotingStore';

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
      throw new Error(`${nameof(TransactionDialogContainer)} no wallet selected`);
    }
    const networkInfo = selectedWallet.getParent().getNetworkInfo();
    const apiMeta = getApiMeta(getApiForNetwork(networkInfo))?.meta;
    if (apiMeta == null) throw new Error(`${nameof(TransactionDialogContainer)} no API selected`);
    const { votingRegTransaction, votingStore } = this.generated.stores.substores.ada;
    const votingRegTx = votingRegTransaction.createVotingRegTx.result;

    if (votingRegTx != null) {
      return (
        <VotingRegTxDialog
          progressInfo={votingStore.progressInfo}
          staleTx={votingRegTransaction.isStale}
          transactionFee={votingRegTx.fee(true)}
          isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
          isHardware={
            selectedWallet.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET
          }
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
          meta={{
            decimalPlaces: apiMeta.decimalPlaces.toNumber(),
            totalSupply: apiMeta.totalSupply,
            ticker: apiMeta.primaryTicker,
          }}
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
      },
    });
  }
}
