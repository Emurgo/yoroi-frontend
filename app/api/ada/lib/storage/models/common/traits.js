// @flow


import type {
  lf$Transaction,
} from 'lovefield';

import {
  Mixin,
} from 'mixwith';

import type {
  IPublicDeriver,
  IGetPublic, IGetPublicRequest, IGetPublicResponse,
  IGetAllUtxos,
  IGetUtxoBalance, IGetUtxoBalanceRequest, IGetUtxoBalanceResponse,
  IScanAddresses,
} from '../PublicDeriver/interfaces';
import type {
  IGetBalance, IGetBalanceRequest, IGetBalanceResponse,
  IChangePasswordRequest, IChangePasswordResponse,
} from './interfaces';
import { ConceptualWallet } from '../ConceptualWallet/index';
import type { IConceptualWallet } from '../ConceptualWallet/interfaces';
import type {
  IHasLevels, IHasSign, IHasPrivateDeriver,
} from './wrapper/interfaces';

import {
  getBalanceForUtxos,
  rawChangePassword,
} from '../utils';

import {
  getAllSchemaTables,
  raii,
  StaleStateError,
  mapToTables,
} from '../../database/utils';

import {
  GetKeyForPublicDeriver,
} from '../../database/walletTypes/core/api/read';
import { GetDerivationSpecific } from '../../database/walletTypes/common/api/read';

import {
  GetUtxoTxOutputsWithTx,
} from  '../../database/transactionModels/utxo/api/read';

import {
  GetPathWithSpecific,
  GetAddress,
} from '../../database/primitives/api/read';
import { UpdateGet, } from '../../database/primitives/api/write';

// =================
//   GetPublicKey
// =================

type GetPublicKeyDependencies = IPublicDeriver<>;
const GetPublicKeyMixin = (
  superclass: Class<GetPublicKeyDependencies>,
) => class GetPublicKey extends superclass implements IGetPublic {

  rawGetPublicKey: (
    lf$Transaction,
    {| GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver> |},
    IGetPublicRequest,
  ) => Promise<IGetPublicResponse> = async (tx, deps, _body) => {
    const derivationAndKey = await deps.GetKeyForPublicDeriver.get(
      super.getDb(), tx,
      super.getPublicDeriverId(),
      true,
      false,
    );
    if (derivationAndKey.publicKey == null) {
      throw new StaleStateError('GetPublicKey::rawGetPublicKey publicKey');
    }
    return derivationAndKey.publicKey;
  }
  getPublicKey: IGetPublicRequest => Promise<IGetPublicResponse> = async (body) => {
    const deps = Object.freeze({
      GetKeyForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawGetPublicKey(tx, deps, body)
    );
  }

  rawChangePubDeriverPassword: (
    lf$Transaction,
    {|
      UpdateGet: Class<UpdateGet>,
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>
    |},
    IChangePasswordRequest,
  ) => Promise<IChangePasswordResponse> = async (tx, deps, body) => {
    const currentRow = await this.rawGetPublicKey(
      tx,
      { GetKeyForPublicDeriver: deps.GetKeyForPublicDeriver, },
      undefined,
    );
    return rawChangePassword(
      super.getDb(), tx,
      { UpdateGet: deps.UpdateGet, },
      {
        ...body,
        oldKeyRow: currentRow
      },
    );
  }
  changePubDeriverPassword: IChangePasswordRequest => Promise<IChangePasswordResponse> = async (body) => {
    const deps = Object.freeze({
      UpdateGet,
      GetKeyForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawChangePubDeriverPassword(tx, deps, body)
    );
  }
};
export const GetPublicKey = Mixin<
  GetPublicKeyDependencies,
  IGetPublic
>(GetPublicKeyMixin);
const GetPublicKeyInstance = (
  (GetPublicKey: any): ReturnType<typeof GetPublicKeyMixin>
);
export function asGetPublicKey<T: IPublicDeriver<any>>(
  obj: T
): void | (IGetPublic & GetPublicKeyDependencies & T) {
  if (obj instanceof GetPublicKeyInstance) {
    return obj;
  }
  return undefined;
}

// ==============
//   GetBalance
// ==============

type GetBalanceDependencies = IPublicDeriver<> & IGetUtxoBalance;
const GetBalanceMixin = (
  superclass: Class<GetBalanceDependencies>,
) => class GetBalance extends superclass implements IGetBalance {
  getBalance: IGetBalanceRequest => Promise<IGetBalanceResponse> = async (body) => {
    return await this.getUtxoBalance(body);
  }
};

export const GetBalance = Mixin<
  GetBalanceDependencies,
  IGetBalance,
>(GetBalanceMixin);
const GetBalanceInstance = (
  (GetBalance: any): ReturnType<typeof GetBalanceMixin>
);
export function asGetBalance<T: IPublicDeriver<any>>(
  obj: T
): void | (IGetBalance & GetBalanceDependencies & T) {
  if (obj instanceof GetBalanceInstance) {
    return obj;
  }
  return undefined;
}


// ==================
//   GetUtxoBalance
// ==================

type GetUtxoBalanceDependencies = IPublicDeriver<ConceptualWallet & IHasLevels> & IGetAllUtxos;
const GetUtxoBalanceMixin = (
  superclass: Class<GetUtxoBalanceDependencies>,
) => class GetUtxoBalance extends superclass implements IGetUtxoBalance {

  rawGetUtxoBalance: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetUtxoBalanceRequest,
    Map<number, string>,
  ) => Promise<IGetUtxoBalanceResponse> = async (tx, deps, _body, derivationTables) => {
    const utxos = await this.rawGetAllUtxos(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    return getBalanceForUtxos(utxos.map(utxo => utxo.output.UtxoTransactionOutput));
  }
  getUtxoBalance: IGetUtxoBalanceRequest => Promise<IGetUtxoBalanceResponse> = async (_body) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetUtxoTxOutputsWithTx,
      GetDerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IGetUtxoBalanceResponse>(
      super.getDb(),
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawGetUtxoBalance(tx, deps, undefined, derivationTables)
    );
  }
};

export const GetUtxoBalance = Mixin<
  GetUtxoBalanceDependencies,
  IGetUtxoBalance,
>(GetUtxoBalanceMixin);
const GetUtxoBalanceInstance = (
  (GetUtxoBalance: any): ReturnType<typeof GetUtxoBalanceMixin>
);
export function asGetUtxoBalance<T: IPublicDeriver<any>>(
  obj: T
): void | (IGetUtxoBalance & GetUtxoBalanceDependencies & T) {
  if (obj instanceof GetUtxoBalanceInstance) {
    return obj;
  }
  return undefined;
}

// =================
//   ScanAddresses
// =================

type ScanAddressesDependencies = IPublicDeriver<> & IScanAddresses;
const ScanAddressesMixin = (
  superclass: Class<ScanAddressesDependencies>,
) => class ScanAddresses extends superclass implements IScanAddresses {
};

export const ScanAddresses = Mixin<
  ScanAddressesDependencies,
  IScanAddresses,
>(ScanAddressesMixin);
const ScanAddressesInstance = (
  (ScanAddresses: any): ReturnType<typeof ScanAddressesMixin>
);
export function asScanAddresses<T: IPublicDeriver<any>>(
  obj: T
): void | (IScanAddresses & ScanAddressesDependencies & T) {
  if (obj instanceof ScanAddressesInstance) {
    return obj;
  }
  return undefined;
}

type HasPrivateDeriverDependencies = IPublicDeriver<ConceptualWallet & IHasPrivateDeriver>;
const HasPrivateDeriverMixin = (
  superclass: Class<HasPrivateDeriverDependencies>,
) => class HasPrivateDeriver extends superclass {
};
export const HasPrivateDeriver = Mixin<
  HasPrivateDeriverDependencies,
  Object,
>(HasPrivateDeriverMixin);
export function asHasPrivateDeriver<Wrapper: ConceptualWallet, Rest>(
  obj: IPublicDeriver<Wrapper> & Rest
): void | (IPublicDeriver<Wrapper & IHasLevels> & Rest) {
  if (obj instanceof HasPrivateDeriver) {
    return obj;
  }
  return undefined;
}

type HasLevelsDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const HasLevelsMixin = (
  superclass: Class<HasLevelsDependencies>,
) => class HasLevels extends superclass {
};
export const HasLevels = Mixin<
  HasLevelsDependencies,
  Object,
>(HasLevelsMixin);
export function asHasLevels<Wrapper: ConceptualWallet, Rest>(
  obj: IPublicDeriver<Wrapper> & Rest
): void | (IPublicDeriver<Wrapper & IHasLevels> & Rest) {
  if (obj instanceof HasLevels) {
    return obj;
  }
  return undefined;
}

type HasSignDependencies = IPublicDeriver<ConceptualWallet & IHasSign>;
const HasSignMixin = (
  superclass: Class<HasSignDependencies>,
) => class HasSign extends superclass {
};
export const HasSign = Mixin<
  HasSignDependencies,
  Object,
>(HasSignMixin);
export function asHasSign<Wrapper: ConceptualWallet, Rest>(
  obj: IPublicDeriver<Wrapper> & Rest
): void | (IPublicDeriver<Wrapper & IHasSign> & Rest) {
  if (obj instanceof HasSign) {
    return obj;
  }
  return undefined;
}
