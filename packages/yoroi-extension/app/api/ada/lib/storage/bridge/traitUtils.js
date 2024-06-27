// @flow

import type { lf$Transaction, } from 'lovefield';

import { asDisplayCutoff, asGetAllAccounting, asGetAllUtxos, asHasLevels, } from '../models/PublicDeriver/traits';
import { PublicDeriver } from '../models/PublicDeriver/index';
import type {
  Address,
  Addressing,
  AddressType,
  IPublicDeriver,
  UsedStatus,
  Value,
} from '../models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../models/ConceptualWallet/index';

import { getAllSchemaTables, mapToTables, raii, } from '../database/utils';
import { GetAddress, GetPathWithSpecific, } from '../database/primitives/api/read';
import type { AddressRow, } from '../database/primitives/tables';
import type { CoreAddressT } from '../database/primitives/enums';
import { CoreAddressTypes } from '../database/primitives/enums';
import { GetDerivationSpecific, } from '../database/walletTypes/common/api/read';
import { GetUtxoTxOutputsWithTx, } from '../database/transactionModels/utxo/api/read';
import { rawGetAddressesForDisplay, } from '../models/utils';
import { getOutputAddressesInSubmittedTxs } from '../../../../localStorage';

export async function rawGetAllAddressesForDisplay(
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
    GetAddress: Class<GetAddress>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {|
    publicDeriver: IPublicDeriver<>,
    type: CoreAddressT,
    ignoreCutoff: boolean,
   |},
  derivationTables: Map<number, string>,
): Promise<Array<{| ...Address, ...AddressType, ...Value, ...Addressing, ...UsedStatus |}>> {

  const withUtxos = asGetAllUtxos(request.publicDeriver);
  let utxoAddresses = withUtxos != null
    ? await withUtxos.rawGetAllUtxoAddresses(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    )
    : [];

  const withAccounting = asGetAllAccounting(request.publicDeriver);
  const accountingAddresses = withAccounting != null
    ? await withAccounting.rawGetAllAccountingAddresses(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    )
    : [];

  // when public deriver level = chain we still have a display cutoff
  const hasCutoff = asDisplayCutoff(request.publicDeriver);
  if (hasCutoff != null && !request.ignoreCutoff) {
    const cutoff = await hasCutoff.rawGetCutoff(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    utxoAddresses = utxoAddresses.filter(address => (
      address.addressing.path[address.addressing.path.length - 1] <= cutoff
    ));
  }

  const addresses = [
    ...utxoAddresses,
    ...accountingAddresses,
  ];

  return await rawGetAddressesForDisplay(
    request.publicDeriver.getDb(), tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    {
      addresses,
      type: request.type,
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
      defaultToken: request.publicDeriver.getParent().getDefaultToken(),
    },
  );
}

export type FullAddressPayload =
  {| ...Address, ...AddressType, ...Value, ...Addressing, ...UsedStatus |};

export async function getAllAddressesForDisplay(
  request: {|
    +publicDeriver: IPublicDeriver<ConceptualWallet>,
    +type: CoreAddressT,
    +ignoreCutoff?: ?boolean,
  |},
): Promise<Array<FullAddressPayload>> {
  const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
  const derivationTables = withLevels == null
    ? new Map()
    : withLevels.getParent().getDerivationTables();
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
  return await raii<PromisslessReturnType<typeof getAllAddressesForDisplay>>(
    request.publicDeriver.getDb(),
    [
      ...depTables,
      ...mapToTables(
        request.publicDeriver.getDb(),
        derivationTables
      ),
    ],
    async tx => await rawGetAllAddressesForDisplay(
      tx,
      deps,
      {
        publicDeriver: request.publicDeriver,
        type: request.type,
        ignoreCutoff: request.ignoreCutoff === true,
      },
      derivationTables,
    )
  );
}

export type AddressRowWithPath = {|
  +address: $ReadOnly<AddressRow>,
  +path: Array<number>,
|};

export async function getAllAddressesForWallet(
  publicDeriver: PublicDeriver<>,
): Promise<{|
  utxoAddresses: Array<$ReadOnly<AddressRowWithPath>>,
  accountingAddresses: Array<$ReadOnly<AddressRowWithPath>>,
|}> {
  const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
  if (!withLevels) {
    throw new Error(`${nameof(this.createSubmittedTransactionData)} publicDerviver traits missing`);
  }
  const derivationTables = withLevels.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    GetDerivationSpecific,
  });
  const depTables = Object.keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(publicDeriver.getDb(), table));

  return await raii(
    publicDeriver.getDb(),
    [
      ...depTables,
      ...mapToTables(publicDeriver.getDb(), derivationTables),
    ],
    dbTx => rawGetAddressRowsForWallet(
      dbTx,
      deps,
      { publicDeriver },
      derivationTables,
    ),
  );
}

export async function getAddressRowsForWallet(
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet>,
  |},
): Promise<Array<$ReadOnly<AddressRowWithPath>>> {
  const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
  const derivationTables = withLevels == null
    ? new Map()
    : withLevels.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetAddress,
    GetPathWithSpecific,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));
  const result = await raii<PromisslessReturnType<typeof rawGetAddressRowsForWallet>>(
    request.publicDeriver.getDb(),
    [
      ...depTables,
      ...mapToTables(
        request.publicDeriver.getDb(),
        derivationTables
      ),
    ],
    async tx => await rawGetAddressRowsForWallet(
      tx,
      deps,
      {
        publicDeriver: request.publicDeriver,
      },
      derivationTables,
    )
  );
  return [...result.utxoAddresses, ...result.accountingAddresses];
}

export async function getAllAddresses(wallet: PublicDeriver<>, usedFilter: boolean): Promise<string[]> {
  const addresses = await getAddressRowsForWallet({ publicDeriver: wallet });
  return addresses
    .filter(a => a.address.IsUsed === usedFilter && a.address.Type === CoreAddressTypes.CARDANO_BASE)
    .map(a => a.address.Hash);
}

export async function getAllUsedAddresses(
  wallet: PublicDeriver<>,
): Promise<string[]> {
  const usedAddresses = await getAllAddresses(wallet, true);
  const outputAddressesInSubmittedTxs = new Set(
    await getOutputAddressesInSubmittedTxs(wallet.publicDeriverId)
  );
  const usedInSubmittedTxs = (await getAllAddresses(wallet, false))
    .filter(address => outputAddressesInSubmittedTxs.has(address));
  return [...usedAddresses, ...usedInSubmittedTxs];
}

export async function rawGetAddressRowsForWallet(
  tx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {| publicDeriver: IPublicDeriver<>, |},
  derivationTables: Map<number, string>,
): Promise<{|
  utxoAddresses: Array<$ReadOnly<AddressRowWithPath>>,
  accountingAddresses: Array<$ReadOnly<AddressRowWithPath>>,
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
      for (const address of family.addrs) {
        utxoAddresses.push({ address, path: family.addressing.path });
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
      for (const address of family.addrs) {
        accountingAddresses.push({ address, path: family.addressing.path });
      }
    }
  }

  return {
    utxoAddresses,
    accountingAddresses,
  };
}
