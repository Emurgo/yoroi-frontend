// @flow
import type { HandlerType } from './type';
import { upsertTxMemo, deleteTxMemo, getAllTxMemo } from '../../../../../app/api/ada/lib/storage/bridge/memos';
import { getDb } from '../../state';
import type { TxMemoLookupKey, } from '../../../../../app/api/ada/lib/storage/bridge/memos';
import type { TxMemoTableInsert, TxMemoTableRow, } from '../../../../../app/api/ada/lib/storage/database/memos/tables';

type UpsertTxMemoRequest = {|
  publicDeriverId: number,
  memo: TxMemoTableInsert | TxMemoTableRow,
|};
type UpsertTxMemoResponse = $ReadOnly<TxMemoTableRow>;

export const UpsertTxMemo: HandlerType<UpsertTxMemoRequest, UpsertTxMemoResponse> = Object.freeze({
  typeTag: 'upsert-tx-memo',

  handle: async (request) => {
    const db = await getDb();
    return await upsertTxMemo({ db, memo: fixMemoDate(request.memo) });
  },
});


type DeleteTxMemoRequest = {| publicDeriverId: number, key: TxMemoLookupKey, |};
type DeleteTxMemoResponse = void;

export const DeleteTxMemo: HandlerType<DeleteTxMemoRequest, DeleteTxMemoResponse> = Object.freeze({
  typeTag: 'delete-tx-memo',

  handle: async (request) => {
    const db = await getDb();
    await deleteTxMemo({ db, key: request.key });
  },
});

type GetAllTxMemosRequest = void;
type GetAllTxMemosResponse = $ReadOnlyArray<$ReadOnly<TxMemoTableRow>>;

export const GetAllTxMemos: HandlerType<
  GetAllTxMemosRequest, GetAllTxMemosResponse,
  {|
    fixMemoDate: typeof fixMemoDate
  |},
> = Object.freeze({
  typeTag: 'get-all-tx-memos',

  handle: async () => {
    const db = await getDb();
    return await getAllTxMemo({ db });
  },

  fixMemoDate,
});

function fixMemoDate(memo: TxMemoTableInsert | TxMemoTableRow): TxMemoTableInsert | TxMemoTableRow {
  memo.LastUpdated = new Date(memo.LastUpdated);
  return memo;
}
