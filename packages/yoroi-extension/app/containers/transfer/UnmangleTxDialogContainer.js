// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { getAddressPayload } from '../../api/ada/lib/storage/bridge/utils';
import type { ConfigType } from '../../../config/config-types';
import { getMangledFilter, } from '../../stores/stateless/mangledAddresses';
import TransferSendPage from './TransferSendPage';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape, } from 'react-intl';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { StoresProps } from '../../stores';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

type Props = {|
  +onClose: void => void,
|};

@observer
export default class UnmangleTxDialogContainer extends Component<{| ...Props, ...StoresProps |}> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    const selected = this.props.stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(UnmangleTxDialogContainer)} no wallet selected`);
    }

    const getAddresses = (clazz) => {
      const entries = this.props.stores.addresses.addressSubgroupMap.get(clazz)?.all ?? [];
      const payloadList = entries.map(
        info => getAddressPayload(info.address, getNetworkById(selected.networkId))
      );
      return new Set(payloadList);
    };


    const filter = getMangledFilter(
      getAddresses,
      selected.networkId,
    );
    // note: don't await
    // noinspection JSIgnoredPromiseFromCall
    this.props.stores.transactionBuilderStore.initializeTx({
      publicDeriver: selected,
      /**
       * We filter to only UTXOs of mangled addresses
       * this ensures that the tx fee is also paid by a UTXO of a mangled address
       */
      filter: utxo => filter(utxo),
    });
  }

  render(): Node {
    const { stores } = this.props;
    const { intl } = this.context;
    const txBuilder = this.props.stores.transactionBuilderStore;
    return (
      <TransferSendPage
        stores={stores}
        onClose={{
          trigger: this.props.onClose,
          label: intl.formatMessage(globalMessages.cancel),
        }}
        onSubmit={{
          trigger: () => {}, // nothing extra to do
          label: intl.formatMessage(globalMessages.confirm),
        }}
        transactionRequest={{
          error: txBuilder.setupSelfTx.error,
          result: txBuilder.tentativeTx,
          reset: this.props.stores.transactionBuilderStore.reset,
        }}
        toTransferTx={tentativeTx => ({
          recoveredBalance: tentativeTx.totalInput(),
          fee: tentativeTx.fee(),
          senders: tentativeTx
            .uniqueSenderAddresses(),
          receivers: tentativeTx
            .receivers(false),
        })}
      />
    );
  }
}
