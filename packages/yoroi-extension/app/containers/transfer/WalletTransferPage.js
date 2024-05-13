// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';

import type { StoresAndActionsProps } from '../../types/injectedProps.types';

import TransferTypeSelect from '../../components/transfer/cards/TransferTypeSelect';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import YoroiTransferPage from './YoroiTransferPage';
import { genLookupOrFail, getTokenName, } from '../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../utils/formatters';

type Props = {|
  ...StoresAndActionsProps,
  publicDeriver: PublicDeriver<>,
|};

@observer
export default class WalletTransferPage extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  // <TODO:PENDING_REMOVAL> paper
  startTransferYoroiPaperFunds: void => void = () => {
    this.props.actions.yoroiTransfer.startTransferFunds.trigger();
  }

  render(): Node {
    const { actions, stores } = this.props;
    const defaultToken = this.props.publicDeriver.getParent().getDefaultToken();
    const defaultTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)({
      identifier: defaultToken.defaultIdentifier,
      networkId: defaultToken.defaultNetworkId,
    });
    return (
      <>
        <TransferTypeSelect
          onByron={this.startTransferYoroiPaperFunds}
          ticker={truncateToken(getTokenName(defaultTokenInfo))}
        />
        <YoroiTransferPage actions={actions} stores={stores} />
      </>
    );
  }
}
