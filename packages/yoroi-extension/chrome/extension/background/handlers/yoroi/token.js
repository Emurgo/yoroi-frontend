// @flow
import type { HandlerType } from './type';
import type { TokenRow } from '../../../../../app/api/ada/lib/storage/database/primitives/tables';
import { getDb } from '../../state';
import { getNetworkById } from '../../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import LocalStorageApi from '../../../../../app/api/localStorage';
import { getAllTokenInfo } from '../../../../../app/api/common/lib/tokens/utils';
import { genCardanoAssetMap } from '../../../../../app/api/ada/lib/storage/bridge/updateTransactions';
import {
  getAllSchemaTables,
  raii,
} from '../../../../../app/api/ada/lib/storage/database/utils';
import { getCardanoStateFetcher } from '../../utils';
import { GetToken } from '../../../../../app/api/ada/lib/storage/database/primitives/api/read';
import { ModifyToken } from '../../../../../app/api/ada/lib/storage/database/primitives/api/write';

export const GetCardanoAssets: HandlerType<
  ?{| networkId: number, tokenIds: Array<string> |},
  $ReadOnlyArray<$ReadOnly<TokenRow>>
> = Object.freeze({
  typeTag: 'get-cardano-assets',

  handle: async (request) => {
    // fixme: probably cache
    const db = await getDb();

    if (request) {
      const network = getNetworkById(request.networkId);
      const deps =  Object.freeze({
        ModifyToken,
        GetToken,
      });
      const depTables = Object
            .keys(deps)
            .map(key => deps[key])
            .flatMap(table => getAllSchemaTables(db, table));

      const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());

      const assetMap = await raii(
        db,
        depTables,
        dbTx => (
          genCardanoAssetMap(
            db,
            dbTx,
            deps,
            request.tokenIds,
            stateFetcher.getTokenInfo,
            stateFetcher.getMultiAssetMintMetadata,
            stateFetcher.getMultiAssetSupply,
            network,
          )
        )
      );
      return [...assetMap.values()];
    }
    const tokens = await getAllTokenInfo({ db });
    return tokens;
  },
});
