// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { WalletType, StepsList } from '../../../../components/wallet/voting/types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import VotingRegTxDialog from '../../../../components/wallet/voting/VotingRegTxDialog';
import type { StoresProps } from '../../../../stores';

type Props = {|
  +stepsList: StepsList,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +goBack: void => void,
  +onError: Error => void,
  +walletType: WalletType,
|};

type AllProps = {| ...Props, ...StoresProps |};

@observer
export default class TransactionDialogContainer extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { stepsList, submit, cancel, goBack, onError, walletType, stores } = this.props;
    const wallet = stores.wallets.selected;
    if (wallet == null) {
      return null;
    }

    const { votingStore } = stores.substores.ada;
    const votingRegTx = votingStore.createVotingRegTx.result;

    if (votingRegTx != null) {
      return (
        <VotingRegTxDialog
          stepsList={stepsList}
          progressInfo={votingStore.progressInfo}
          staleTx={votingStore.isStale}
          transactionFee={votingRegTx.fee()}
          isSubmitting={stores.wallets.sendMoneyRequest.isExecuting}
          getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
          onCancel={cancel}
          goBack={goBack}
          onSubmit={async ({ password }) => {
            try {
              await stores.substores.ada.votingStore.signTransaction({ wallet, password });
              await submit();
            } catch (error) {
              onError(error);
            }
          }}
          error={votingStore.error}
          walletType={walletType}
        />
      );
    }
    return null;
  }
}
