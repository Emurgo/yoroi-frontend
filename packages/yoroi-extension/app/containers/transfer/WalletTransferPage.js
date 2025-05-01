// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { IntlContext } from 'react-intl';

import TransferTypeSelect from '../../components/transfer/cards/TransferTypeSelect';
import YoroiTransferPage from './YoroiTransferPage';
import type { StoresProps } from '../../stores';

@observer
export default class WalletTransferPage extends Component<StoresProps> {
  static contextType:any = IntlContext;
  onClose: void => void = () => {
    this.props.stores.uiDialogs.closeActiveDialog();
  };

  // <TODO:PENDING_REMOVAL> paper
  startTransferYoroiPaperFunds: void => void = () => {
    this.props.stores.yoroiTransfer.startTransferFunds();
  };

  render(): Node {
    const { stores } = this.props;
    const wallet = stores.wallets.selected;
    if (wallet == null) {
      return null;
    }

    const defaultTokenInfo = stores.tokenInfoStore.getDefaultTokenInfo(wallet.networkId);

    return (
      <>
        <TransferTypeSelect
          onByron={this.startTransferYoroiPaperFunds}
          ticker={truncateToken(getTokenName(defaultTokenInfo))}
        />
        <YoroiTransferPage stores={stores} />
      </>
    );
  }
}
