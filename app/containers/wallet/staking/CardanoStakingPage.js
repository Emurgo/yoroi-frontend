// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import DelegationSendForm from '../../../components/wallet/send/DelegationSendForm';

export type GeneratedData = typeof CardanoStakingPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  urlTemplate: string,
|};

const messages = defineMessages({
});

/*::
declare var chrome;
*/

@observer
export default class CardanoStakingPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    // this.generated.actions.jormungandr.delegationTransaction.reset.trigger();
  }

  render(): Node {
    const { stores } = this.generated;
    const { intl } = this.context;

    return (
      <>
        {this.getDialog()}
        <DelegationSendForm
          hasAnyPending={false}
          onSubmit={() => {}}
          updatePool={() => {}}
          reset={() => {}}
          error={undefined}
        />
      </>);
  }

  getDialog: void => (void | Node) = () => {
    // if (
    //   delegationTxStore.createDelegationTx.isExecuting ||
    //   (delegationTx == null && delegationTxStore.selectedPools.length >= 1)
    // ) {
    //   return (
    //     <Dialog
    //       title={intl.formatMessage(globalMessages.processingLabel)}
    //       closeOnOverlayClick={false}
    //     >
    //       <AnnotatedLoader
    //         title={intl.formatMessage(globalMessages.processingLabel)}
    //         details={intl.formatMessage(globalMessages.txGeneration)}
    //       />
    //     </Dialog>
    //   );
    // }
    // if (delegationTxStore.createDelegationTx.error != null) {
    //   return (
    //     <Dialog
    //       title={intl.formatMessage(globalMessages.errorLabel)}
    //       closeOnOverlayClick={false}
    //       onClose={this.cancel}
    //       closeButton={<DialogCloseButton onClose={this.cancel} />}
    //       actions={dialogBackButton}
    //     >
    //       <>
    //         <center><InvalidURIImg /></center>
    //         <ErrorBlock
    //           error={delegationTxStore.createDelegationTx.error}
    //         />
    //       </>
    //     </Dialog>
    //   );
    // }
    // if (delegationTx != null && delegationTxStore.selectedPools.length >= 1 && showSignDialog) {
    //   return (
    //     <DelegationTxDialog
    //       staleTx={delegationTxStore.isStale}
    //       poolName={delegationTxStore.selectedPools[0].name}
    //       poolHash={delegationTxStore.selectedPools[0].poolHash}
    //       transactionFee={getJormungandrTxFee(delegationTx.unsignedTx.IOs, true)}
    //       amountToDelegate={delegationTx.totalAmountToDelegate}
    //       approximateReward={approximateReward(delegationTx.totalAmountToDelegate)}
    //       isSubmitting={
    //         delegationTxStore.signAndBroadcastDelegationTx.isExecuting
    //       }
    //       onCancel={this.cancel}
    //       onSubmit={({ password }) => delegationTxActions.signTransaction.trigger({
    //         password,
    //         publicDeriver: selectedWallet,
    //       })}
    //       classicTheme={profile.isClassicTheme}
    //       error={delegationTxStore.signAndBroadcastDelegationTx.error}
    //       selectedExplorer={stores.explorers.selectedExplorer
    //         .get(
    //           selectedWallet.getParent().getNetworkInfo().NetworkId
    //         ) ?? (() => { throw new Error('No explorer for wallet network'); })()
    //       }
    //       meta={{
    //         decimalPlaces: apiMeta.decimalPlaces.toNumber(),
    //         totalSupply: apiMeta.totalSupply,
    //       }}
    //     />
    //   );
    // }
    // if (delegationTx != null && !showSignDialog) {
    //   return (
    //     <DelegationSuccessDialog
    //       onClose={delegationTxActions.complete.trigger}
    //       classicTheme={profile.isClassicTheme}
    //     />
    //   );
    // }
    return undefined;
  }

  @computed get generated(): {|
    actions: {|
    |},
    stores: {|
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(CardanoStakingPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
      },
      actions: {
      },
    });
  }
}
