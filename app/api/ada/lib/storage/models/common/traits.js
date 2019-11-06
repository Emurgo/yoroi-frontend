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

type GetPublicKeyDependencies = IPublicDeriver;
const GetPublicKeyMixin = (
  superclass: Class<GetPublicKeyDependencies>,
) => class GetPublicKey extends superclass implements IGetPublic {

  rawGetPublicKey = async (
    tx: lf$Transaction,
    deps: {| GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver> |},
    _body: IGetPublicRequest,
  ): Promise<IGetPublicResponse> => {
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
  getPublicKey = async (
    body: IGetPublicRequest,
  ): Promise<IGetPublicResponse> => {
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

  rawChangePubDeriverPassword = async (
    tx: lf$Transaction,
    deps: {|
      UpdateGet: Class<UpdateGet>,
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>
    |},
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
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
  changePubDeriverPassword = async (
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
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
export function asGetPublicKey<T: IPublicDeriver>(
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

type GetBalanceDependencies = IPublicDeriver & IGetUtxoBalance;
const GetBalanceMixin = (
  superclass: Class<GetBalanceDependencies>,
) => class GetBalance extends superclass implements IGetBalance {
  getBalance = async (
    body: IGetBalanceRequest,
  ): Promise<IGetBalanceResponse> => {
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
export function asGetBalance<T: IPublicDeriver>(
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

type GetUtxoBalanceDependencies = IPublicDeriver & IGetAllUtxos;
const GetUtxoBalanceMixin = (
  superclass: Class<GetUtxoBalanceDependencies>,
) => class GetUtxoBalance extends superclass implements IGetUtxoBalance {

  rawGetUtxoBalance = async (
    tx: lf$Transaction,
    deps: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    _body: IGetUtxoBalanceRequest,
    derivationTables: Map<number, string>,
  ): Promise<IGetUtxoBalanceResponse> => {
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
  getUtxoBalance = async (
    _body: IGetUtxoBalanceRequest,
  ): Promise<IGetUtxoBalanceResponse> => {
    const derivationTables = this.getConceptualWallet().getDerivationTables();
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
export function asGetUtxoBalance<T: IPublicDeriver>(
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

type ScanAddressesDependencies = IPublicDeriver & IScanAddresses;
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
export function asScanAddresses<T: IPublicDeriver>(
  obj: T
): void | (IScanAddresses & ScanAddressesDependencies & T) {
  if (obj instanceof ScanAddressesInstance) {
    return obj;
  }
  return undefined;
}
