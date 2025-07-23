// @flow

import type { lf$Database } from 'lovefield';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';
import type { TxMemoTableInsertCommon, TxMemoTableInsert, TxMemoTableRow } from '../database/memos/tables';
import { GetTxMemo } from '../database/memos/api/read';
import { ModifyTxMemo } from '../database/memos/api/write';

export type TxMemoPreLookupKey = {|
  /*
   * Should be checksum of public deriver
   * But for wallets without a public key, it can be something else
   */
  publicDeriverId: number,
  plateTextPart: string,
  txHash: string,
|};
export type TxMemoLookupKey = {|
  walletId: string,
  txHash: string,
|};

export type TxMemoTablePreInsert = {|
  /*
   * Should be checksum of public deriver
   * But for wallets without a public key, it can be something else
   */
  publicDeriverId: number,
  plateTextPart: string,
  memo: TxMemoTableInsertCommon,
|}


export type TxMemoTableUpsert = {|
  /*
   * Should be checksum of public deriver
   * But for wallets without a public key, it can be something else
   */
  publicDeriverId: number,
  plateTextPart: string,
  memo: TxMemoTableInsertCommon,
|}

// upsertTxMemo

export type UpsertTxMemoRequest = {|
  db: lf$Database,
  memo: TxMemoTableInsert | TxMemoTableRow,
|};
export type UpsertTxMemoResponse = $ReadOnly<TxMemoTableRow>;
export type UpsertTxMemoFunc = (
  request: UpsertTxMemoRequest
) => Promise<UpsertTxMemoResponse>;

// deleteTxMemo

export type DeleteTxMemoRequest = {|
  db: lf$Database,
  key: TxMemoLookupKey,
|};
export type DeleteTxMemoResponse = void;
export type DeleteTxMemoFunc = (
  request: DeleteTxMemoRequest
) => Promise<DeleteTxMemoResponse>;

// getAllTxMemo

export type GetAllTxMemoRequest = {|
  db: lf$Database,
|};
export type GetAllTxMemoResponse = $ReadOnlyArray<$ReadOnly<TxMemoTableRow>>;
export type GetAllTxMemoFunc = (
  request: GetAllTxMemoRequest
) => Promise<GetAllTxMemoResponse>;

export async function upsertTxMemo(
  request: UpsertTxMemoRequest
): Promise<UpsertTxMemoResponse> {
  const deps = Object.freeze({
    ModifyTxMemo
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii<UpsertTxMemoResponse>(
    request.db,
    depTables,
    async tx => deps.ModifyTxMemo.upsertMemo(
      request.db, tx,
      request.memo
    )
  );
}

export async function deleteTxMemo(
  request: DeleteTxMemoRequest
): Promise<DeleteTxMemoResponse> {
  const deps = Object.freeze({
    ModifyTxMemo
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii<DeleteTxMemoResponse>(
    request.db,
    depTables,
    async tx => deps.ModifyTxMemo.deleteMemo(
      request.db, tx,
      request.key
    )
  );
}

export async function getAllTxMemo(
  request: GetAllTxMemoRequest
): Promise<GetAllTxMemoResponse> {
  const deps = Object.freeze({
    GetTxMemo
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii<GetAllTxMemoResponse>(
    request.db,
    depTables,
    async tx => deps.GetTxMemo.getAllMemos(
      request.db, tx,
    )
  );
}
