// @flow
import type { Node } from 'react';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import TransferTypeSelect from '../../components/transfer/cards/TransferTypeSelect';
import YoroiTransferPage from './YoroiTransferPage';

@observer
export default class WalletTransferPage extends Component<StoresAndActionsProps> {
  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  // <TODO:PENDING_REMOVAL> paper
  startTransferYoroiPaperFunds: void => void = () => {
    this.props.actions.yoroiTransfer.startTransferFunds.trigger();
  };

  render(): Node {
    const { actions, stores } = this.props;
    const wallet = stores.wallets.selected;
    if (wallet == null) {
      return null;
    }

    const defaultTokenInfo = stores.tokenInfoStore.getDefaultTokenInfo(wallet.networkId);

    return (
      <>
        <TransferTypeSelect onByron={this.startTransferYoroiPaperFunds} ticker={truncateToken(getTokenName(defaultTokenInfo))} />
        <YoroiTransferPage actions={actions} stores={stores} />
      </>
    );
  }
}
