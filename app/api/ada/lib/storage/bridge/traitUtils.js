// @flow

import type {
  lf$Transaction,
} from 'lovefield';

import {
  asDisplayCutoff,
  asGetAllUtxos,
  asGetAllAccounting
} from '../models/PublicDeriver/traits';
import type {
  IPublicDeriver,
  IGetAllUtxos,
  Address, Value, Addressing, UsedStatus,
} from '../models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../models/ConceptualWallet/index';
import type { IHasLevels } from '../models/ConceptualWallet/interfaces';

import {
  getAllSchemaTables,
  raii,
  mapToTables,
} from '../database/utils';
import {
  GetAddress,
  GetPathWithSpecific,
} from '../database/primitives/api/read';
import type {
  AddressRow,
} from '../database/primitives/tables';
import type {
  CoreAddressT
} from '../database/primitives/enums';
import {
  GetDerivationSpecific,
} from '../database/walletTypes/common/api/read';
import {
  GetUtxoTxOutputsWithTx,
} from '../database/transactionModels/utxo/api/read';

import {
  rawGetAddressesForDisplay,
} from '../models/utils';

export async function rawGetAllAddressesForDisplay(
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
    GetAddress: Class<GetAddress>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {
    publicDeriver: IPublicDeriver<> & IGetAllUtxos,
    type: CoreAddressT,
  },
  derivationTables: Map<number, string>,
): Promise<Array<{| ...Address, ...Value, ...Addressing, ...UsedStatus |}>> {
  let addresses = await request.publicDeriver.rawGetAllUtxoAddresses(
    tx,
    {
      GetAddress: deps.GetAddress,
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    undefined,
    derivationTables,
  );
  // when public deriver level = chain we still have a display cutoff
  const hasCutoff = asDisplayCutoff(request.publicDeriver);
  if (hasCutoff != null) {
    const cutoff = await hasCutoff.rawGetCutoff(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    addresses = addresses.filter(address => (
      address.addressing.path[address.addressing.path.length - 1] <= cutoff
    ));
  }
  return await rawGetAddressesForDisplay(
    request.publicDeriver.getDb(), tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    {
      addresses,
      type: request.type
    },
  );
}

export async function getAllAddressesForDisplay(
  request: {
    publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetAllUtxos,
    type: CoreAddressT,
  },
): Promise<Array<{| ...Address, ...Value, ...Addressing, ...UsedStatus |}>> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetUtxoTxOutputsWithTx,
    GetAddress,
    GetPathWithSpecific,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));
  return await raii(
    request.publicDeriver.getDb(),
    [
      ...depTables,
      ...mapToTables(request.publicDeriver.getDb(), derivationTables),
    ],
    async tx => await rawGetAllAddressesForDisplay(
      tx,
      deps,
      {
        publicDeriver: request.publicDeriver,
        type: request.type,
      },
      derivationTables,
    )
  );
}

export async function rawGetAddressRowsForWallet(
  tx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {
    publicDeriver: IPublicDeriver<>,
  },
  derivationTables: Map<number, string>,
): Promise<{|
  utxoAddresses: Array<$ReadOnly<AddressRow>>,
  accountingAddresses: Array<$ReadOnly<AddressRow>>,
|}> {
  const utxoAddresses = [];
  const accountingAddresses = [];
  const withUtxos = asGetAllUtxos(request.publicDeriver);
  if (withUtxos != null) {
    const addrResponse = await withUtxos.rawGetAllUtxoAddresses(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    for (const family of addrResponse) {
      for (const addr of family.addrs) {
        utxoAddresses.push(addr);
      }
    }
  }
  const withAccounting = asGetAllAccounting(request.publicDeriver);
  if (withAccounting != null) {
    const addrResponse = await withAccounting.rawGetAllAccountingAddresses(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    for (const family of addrResponse) {
      for (const addr of family.addrs) {
        accountingAddresses.push(addr);
      }
    }
  }

  return {
    utxoAddresses,
    accountingAddresses,
  };
}
