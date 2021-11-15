// @flow
import type { ComponentType, Node } from 'react';
import type { Asset } from './AssetsList';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { observer } from 'mobx-react';
import { Box } from '@mui/system';
import TokenList from './TokenList';

type Props = {|
  +assetsList: Asset[],
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +assetDeposit: null | MultiToken,
  +shouldHideBalance: boolean,
|};

function Tokens({ assetDeposit, assetsList, getTokenInfo, shouldHideBalance }: Props): Node {
  return (
    <Box borderRadius="8px" bgcolor="var(--yoroi-palette-common-white)">
      <TokenList
        assetsList={assetsList}
        assetDeposit={assetDeposit}
        getTokenInfo={getTokenInfo}
        shouldHideBalance={shouldHideBalance}
      />
    </Box>
  );
}

export default (observer(Tokens): ComponentType<Props>);
