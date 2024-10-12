// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../../../types/injectedProps.types';
import type { WalletType, StepsList } from '../../../../components/wallet/voting/types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { withLayout } from '../../../../styles/context/layout';
import VotingRegTxDialog from '../../../../components/wallet/voting/VotingRegTxDialog';

type Props = {|
  ...StoresAndActionsProps,
  +stepsList: StepsList,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +goBack: void => void,
  +classicTheme: boolean,
  +onError: Error => void,
  +walletType: WalletType,
|};
type InjectedLayoutProps = {|
  +isRevampLayout: boolean,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class TransactionDialogContainer extends Component<AllProps> {
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
          classicTheme={this.props.classicTheme}
          error={votingStore.error}
          walletType={walletType}
          isRevamp={this.props.isRevampLayout}
        />
      );
    }
    return null;
  }
}
export default (withLayout(TransactionDialogContainer): ComponentType<Props>);
