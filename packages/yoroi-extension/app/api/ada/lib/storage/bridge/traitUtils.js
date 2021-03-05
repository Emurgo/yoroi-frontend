// @flow

import type {
  lf$Transaction,
} from 'lovefield';

import {
  asDisplayCutoff,
  asGetAllUtxos,
  asGetAllAccounting,
  asHasLevels,
} from '../models/PublicDeriver/traits';
import type {
  IPublicDeriver,
  Address, AddressType, Value, Addressing, UsedStatus,
} from '../models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../models/ConceptualWallet/index';

import {
  getAllSchemaTables,
  raii,
  mapToTables,
} from '../database/utils';
import {
  GetAddress,
  GetPathWithSpecific,
  GetToken,
  AssociateToken,
} from '../database/primitives/api/read';
import type {
  AddressRow,
  TokenRow,
  TokenListRow,
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
  request: {|
    publicDeriver: IPublicDeriver<>,
    type: CoreAddressT,
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

export async function getAllAddressesForDisplay(
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet>,
    type: CoreAddressT,
  |},
): Promise<Array<{| ...Address, ...AddressType, ...Value, ...Addressing, ...UsedStatus |}>> {
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
  request: {| publicDeriver: IPublicDeriver<>, |},
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

export async function buildTokenMap(
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet>,
    tokenListIds: Array<number>,
  |},
): Promise<$ReadOnlyArray<{|
  TokenList: $ReadOnly<TokenListRow>,
  Token: $ReadOnly<TokenRow>,
|}>> {
  const deps = Object.freeze({
    AssociateToken,
    GetToken,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));
  return await raii<PromisslessReturnType<typeof buildTokenMap>>(
    request.publicDeriver.getDb(),
    depTables,
    async tx => await deps.AssociateToken.join(
      request.publicDeriver.getDb(), tx,
      {
        listIds: request.tokenListIds,
        networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
      }
    )
  );
}
