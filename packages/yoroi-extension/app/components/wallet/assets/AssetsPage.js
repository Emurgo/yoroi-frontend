// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './AssetsPage.scss';

import AssetsList from './AssetsList';
import type { Asset } from './AssetsList';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey,
} from '../../../api/common/lib/MultiToken';
import type { TokenRow, NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +assetsList: Asset[],
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +assetDeposit: null | MultiToken,
  +shouldHideBalance: boolean,
  +network: $ReadOnly<NetworkRow>
|};

@observer
export default class AssetsPage extends Component<Props> {

  render(): Node {
    const { assetDeposit, network, assetsList, getTokenInfo, shouldHideBalance } = this.props;
    return (
      <div className={styles.component}>
        <AssetsList
          assetsList={assetsList}
          assetDeposit={assetDeposit}
          getTokenInfo={getTokenInfo}
          shouldHideBalance={shouldHideBalance}
          network={network}
        />
      </div>
    );
  }
}