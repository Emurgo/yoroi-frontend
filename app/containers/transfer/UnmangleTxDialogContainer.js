// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import {
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { getAddressPayload } from '../../api/ada/lib/storage/bridge/utils';
import type { ConfigType } from '../../../config/config-types';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import LocalizableError from '../../i18n/LocalizableError';
import type { SetupSelfTxRequest } from '../../stores/toplevel/TransactionBuilderStore';
import { GROUP_MANGLED } from '../../stores/stateless/addressStores';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import TransferSendPage from './TransferSendPage';
import type { GeneratedData as TransferSendData } from './TransferSendPage';

declare var CONFIG: ConfigType;

export type GeneratedData = typeof UnmangleTxDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onClose: void => void,
|};

@observer
export default class UnmangleTxDialogContainer extends Component<Props> {

  componentDidMount() {
    const selected = this.generated.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no wallet selected`);
    }
    const withChains = asHasUtxoChains(selected);
    if (withChains == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no chains`);
    }

    const request = this.generated.stores.addresses.addressSubgroupMap.get(GROUP_MANGLED.class);
    if (request == null) throw new Error('No request. Should never happen');

    const filterTo = new Set(
      request.all
        // we don't want to include any UTXO that would do nothing but increase the tx fee
        .filter(info => info.value != null)
        // TODO: filtering in Haskell Shelley is more complicated unfortunately
        // .filter(info => info.value.gt(CONFIG.genesis.linearFee.coefficient))
        .map(info => getAddressPayload(info.address, selected.getParent().getNetworkInfo()))
    );

    // note: don't await
    this.generated.actions.txBuilderActions.initialize.trigger({
      publicDeriver: withChains,
      /**
       * We filter to only UTXOs of mangled addresses
       * this ensures that the tx fee is also paid by a UTXO of a mangled address
       */
      filter: utxo => filterTo.has(utxo.address),
    });
  }

  render(): Node {
    const txBuilder = this.generated.stores.transactionBuilderStore;
    return (
      <TransferSendPage
        {...this.generated.TransferSendProps}
        onClose={this.props.onClose}
        transactionRequest={{
          error: txBuilder.setupSelfTx.error,
          result: txBuilder.tentativeTx,
          reset: this.generated.actions.txBuilderActions.reset.trigger,
        }}
        toTransferTx={tentativeTx => ({
          recoveredBalance: tentativeTx.totalInput(true),
          fee: tentativeTx.fee(true),
          senders: tentativeTx
            .uniqueSenderAddresses(),
          receiver: tentativeTx
            .receivers(false)[0],
        })}
      />
    );
  }

  @computed get generated(): {|
    TransferSendProps: InjectedOrGenerated<TransferSendData>,
    actions: {|
      txBuilderActions: {|
        reset: {| trigger: (params: void) => void |},
        initialize: {| trigger: (params: SetupSelfTxRequest) => Promise<void> |},
      |},
    |},
    stores: {|
      addresses: {|
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      transactionBuilderStore: {|
        setupSelfTx: {|
          error: ?LocalizableError,
        |},
        tentativeTx: null | ISignRequest<any>,
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      TransferSendProps: ({ actions, stores, }: InjectedOrGenerated<TransferSendData>),
      stores: {
        wallets: {
          selected: stores.wallets.selected,
        },
        addresses: {
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
        },
        transactionBuilderStore: {
          tentativeTx: stores.transactionBuilderStore.tentativeTx,
          setupSelfTx: {
            error: stores.transactionBuilderStore.setupSelfTx.error,
          },
        },
      },
      actions: {
        txBuilderActions: {
          initialize: {
            trigger: actions.txBuilderActions.initialize.trigger,
          },
          reset: {
            trigger: actions.txBuilderActions.reset.trigger
          },
        },
      },
    });
  }
}
