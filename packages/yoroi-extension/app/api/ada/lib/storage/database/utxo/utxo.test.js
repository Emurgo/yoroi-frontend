// @flow

import { schema, } from 'lovefield';
import { loadLovefieldDBFromDump } from '../index';
import { GetUtxoAtSafePoint, GetUtxoDiffToBestBlock } from './api/read';
import { ModifyUtxoAtSafePoint, ModifyUtxoDiffToBestBlock } from './api/write';
import { getAllSchemaTables, raii } from '../utils';
import dbdump from '../../tests/testDb.dump.json';

const UTXO_AT_SAFE_BLOCK_1 = {
  lastSafeBlockHash: 'lastSafeBlockHash1',
  utxos: [
    {
      utxoId: 'utxoId1',
      txHash: 'txHash1',
      txIndex: 0,
      receiver: 'receiver1',
      amount: '42',
      assets: [],
      blockNum: 1
    }
  ],
};

const UTXO_AT_SAFE_BLOCK_2 = {
  lastSafeBlockHash: 'lastSafeBlockHash2',
  utxos: [
    {
      utxoId: 'utxoId2',
      txHash: 'txHash2',
      txIndex: 0,
      receiver: 'receiver2',
      amount: '42',
      assets: [],
      blockNum: 2
    }
  ],
};

const UTXO_DIFF_TO_BEST_BLOCK_1 = {
  lastBestBlockHash: 'lastBestBlockHash1',
  spentUtxoIds: ['utxoId1'],
  newUtxos: [
    {
      utxoId: 'utxoId3',
      txHash: 'txHash3',
      txIndex: 0,
      receiver: 'receiver3',
      amount: '42',
      assets: [],
      blockNum: 3
    }
  ],
};

const UTXO_DIFF_TO_BEST_BLOCK_2 = {
  lastBestBlockHash: 'lastBestBlockHash2',
  spentUtxoIds: ['utxoId2'],
  newUtxos: [
    {
      utxoId: 'utxoId4',
      txHash: 'txHash4',
      txIndex: 0,
      receiver: 'receiver4',
      amount: '42',
      assets: [],
      blockNum: 4
    }
  ],
};

let db;
let publicDeriverId;

beforeAll(async () => {
  db = await loadLovefieldDBFromDump(schema.DataStoreType.MEMORY, dbdump);

  publicDeriverId = 1;
});

test('UtxoAtSafePoint', async () => {
  // add
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoAtSafePoint),
    async tx => {
      await ModifyUtxoAtSafePoint.addOrReplace(
        db,
        tx,
        publicDeriverId,
        UTXO_AT_SAFE_BLOCK_1,
      );
    }
  );

  // check
  let result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoAtSafePoint),
    tx => GetUtxoAtSafePoint.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );

  expect(result).toEqual(
    expect.objectContaining({ UtxoAtSafePoint: UTXO_AT_SAFE_BLOCK_1 })
  );

  // replace
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoAtSafePoint),
    async tx => {
      await ModifyUtxoAtSafePoint.addOrReplace(
        db,
        tx,
        publicDeriverId,
        UTXO_AT_SAFE_BLOCK_2,
      );
    }
  );

  // check
  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoAtSafePoint),
    tx => GetUtxoAtSafePoint.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );
  
  expect(result).toEqual(
    expect.objectContaining({ UtxoAtSafePoint: UTXO_AT_SAFE_BLOCK_2 })
  );

  // remove
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoAtSafePoint),
    async tx => {
      await ModifyUtxoAtSafePoint.remove(
        db,
        tx,
        publicDeriverId,
      );
    }
  );

  // check
  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoAtSafePoint),
    tx => GetUtxoAtSafePoint.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );
  
  expect(result).toBe(undefined);
});

test('UtxoDiffToBestBlock', async () => {
  // initially empty
  let result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoDiffToBestBlock),
    tx => GetUtxoDiffToBestBlock.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );

  expect(result).toEqual([]);

  // add
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoDiffToBestBlock),
    async tx => {
      await ModifyUtxoDiffToBestBlock.add(
        db,
        tx,
        publicDeriverId,
        UTXO_DIFF_TO_BEST_BLOCK_1,
      );
    }
  );

  // check
  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoDiffToBestBlock),
    tx => GetUtxoDiffToBestBlock.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );

  expect(result).toEqual([UTXO_DIFF_TO_BEST_BLOCK_1]);

  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoDiffToBestBlock),
    tx => GetUtxoDiffToBestBlock.findLastBestBlockHash(
      db,
      tx,
      publicDeriverId,
      UTXO_DIFF_TO_BEST_BLOCK_1.lastBestBlockHash,
    )
  );

  expect(result).toEqual(UTXO_DIFF_TO_BEST_BLOCK_1);

  // add duplicate
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoDiffToBestBlock),
    async tx => {
      await ModifyUtxoDiffToBestBlock.add(
        db,
        tx,
        publicDeriverId,
        UTXO_DIFF_TO_BEST_BLOCK_1,
      );
    }
  );

  // check
  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoDiffToBestBlock),
    tx => GetUtxoDiffToBestBlock.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );

  expect(result).toEqual([UTXO_DIFF_TO_BEST_BLOCK_1]);

  // remove
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoDiffToBestBlock),
    async tx => {
      await ModifyUtxoDiffToBestBlock.remove(
        db,
        tx,
        publicDeriverId,
        UTXO_DIFF_TO_BEST_BLOCK_1.lastBestBlockHash,
      );
    }
  );

  // check
  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoDiffToBestBlock),
    tx => GetUtxoDiffToBestBlock.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );

  expect(result).toEqual([]);

  // add two
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoDiffToBestBlock),
    async tx => {
      await ModifyUtxoDiffToBestBlock.add(
        db,
        tx,
        publicDeriverId,
        UTXO_DIFF_TO_BEST_BLOCK_1,
      );
    }
  );
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoDiffToBestBlock),
    async tx => {
      await ModifyUtxoDiffToBestBlock.add(
        db,
        tx,
        publicDeriverId,
        UTXO_DIFF_TO_BEST_BLOCK_2,
      );
    }
  );

  // check
  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoDiffToBestBlock),
    tx => GetUtxoDiffToBestBlock.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );

  expect(result).toEqual([UTXO_DIFF_TO_BEST_BLOCK_1, UTXO_DIFF_TO_BEST_BLOCK_2]);

  // remove all
  await raii(
    db,
    getAllSchemaTables(db, ModifyUtxoDiffToBestBlock),
    async tx => {
      await ModifyUtxoDiffToBestBlock.removeAll(
        db,
        tx,
        publicDeriverId,
      );
    }
  );

  // check
  result = await raii(
    db,
    getAllSchemaTables(db, GetUtxoDiffToBestBlock),
    tx => GetUtxoDiffToBestBlock.forWallet(
      db,
      tx,
      publicDeriverId,
    )
  );

  expect(result).toEqual([]);
});
