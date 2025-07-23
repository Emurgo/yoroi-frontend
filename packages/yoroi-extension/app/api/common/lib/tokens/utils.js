// @flow

import type { lf$Database } from 'lovefield';
import {
  getAllSchemaTables,
  raii,
} from '../../../ada/lib/storage/database/utils';
import { GetToken } from '../../../ada/lib/storage/database/primitives/api/read';
import type { TokenRow } from '../../../ada/lib/storage/database/primitives/tables';

// getAllTokenInfo

export type GetTokenInfoRequest = {|
  db: lf$Database,
|};
export type GetTokenInfoResponse = $ReadOnlyArray<$ReadOnly<TokenRow>>;
export type GetTokenInfoFunc = (
  request: GetTokenInfoRequest
) => Promise<GetTokenInfoResponse>;

export async function getAllTokenInfo(
  request: GetTokenInfoRequest
): Promise<GetTokenInfoResponse> {
  const deps = Object.freeze({
    GetToken
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii<GetTokenInfoResponse>(
    request.db,
    depTables,
    async tx => deps.GetToken.all(
      request.db, tx,
    )
  );
}
