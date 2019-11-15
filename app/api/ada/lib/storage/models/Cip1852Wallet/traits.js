// @flow

import { lf$Transaction } from 'lovefield';
import {
  Mixin,
} from 'mixwith';
import type {
  IPublicDeriver
} from '../PublicDeriver/interfaces';
import type {
  IGetAllAccountingAddressesRequest, IGetAllAccountingAddressesResponse,
  IGetAllAccounting,
  ICip1852Parent,
} from './interfaces';
import { GetDerivationSpecific } from '../../database/walletTypes/common/api/read';
import {
  GetPathWithSpecific,
  GetAddress,
} from '../../database/primitives/api/read';
import {
  getAllSchemaTables,
  raii,
  StaleStateError,
} from '../../database/utils';
import { Cip1852Wallet } from './wrapper';

// ====================
//   GetAllAccounting
// ====================

type GetAllAccountingDependencies = IPublicDeriver<>;
const GetAllAccountingMixin = (
  superclass: Class<GetAllAccountingDependencies>,
) => class GetAllAccounting extends superclass implements IGetAllAccounting {

  rawGetAllAccountingAddresses: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetAllAccountingAddressesRequest,
  ) => Promise<IGetAllAccountingAddressesResponse> = async (
    _tx,
    _deps,
    _body,
  ) => {
    // TODO: some way to know if single chain is an account or not
    return []; // TODO
  }
  getAllAccountingAddresses: (
    IGetAllAccountingAddressesRequest
  ) => Promise<IGetAllAccountingAddressesResponse> = async (
    body,
  ) => {
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetDerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawGetAllAccountingAddresses(tx, deps, body)
    );
  }
};

const GetAllAccounting = Mixin<
  GetAllAccountingDependencies,
  IGetAllAccounting,
>(GetAllAccountingMixin);
const GetAllAccountingInstance = (
  (GetAllAccounting: any): ReturnType<typeof GetAllAccountingMixin>
);
export function asGetAllAccounting<T: IPublicDeriver<any>>(
  obj: T
): void | (IGetAllAccounting & GetAllAccountingDependencies & T) {
  if (obj instanceof GetAllAccountingInstance) {
    return obj;
  }
  return undefined;
}

// ========================
//   AddCip1852FromPublic
// ========================

// TODO: implement
// type AddCip1852FromPublicDependencies = IPublicDeriver & ICip1852Wallet;
// const AddCip1852FromPublicMixin = (
//   superclass: Class<AddCip1852FromPublicDependencies>,
// ) => class AddCip1852FromPublic extends superclass implements IAddCip1852FromPublic {

//   rawAddCip1852FromPublic = async (
//     tx: lf$Transaction,
//     deps: {|
//       GetPublicDeriver: Class<GetPublicDeriver>,
//       AddCip1852Tree: Class<AddCip1852Tree>,
//       ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
//       GetDerivationsByPath: Class<GetDerivationsByPath>,
//       GetPathWithSpecific: Class<GetPathWithSpecific>,
//       GetCip1852DerivationSpecific: Class<GetCip1852DerivationSpecific>,
//     |},
//     body: IAddCip1852FromPublicRequest,
//   ): Promise<IAddCip1852FromPublicResponse> => {
//     const pubDeriver = await deps.GetPublicDeriver.get(
//       super.getDb(), tx,
//       super.getPublicDeriverId(),
//     );
//     if (pubDeriver === undefined) {
//       throw new Error('AddCip1852FromPublic::rawAddCip1852FromPublic pubDeriver');
//     }
//     await deps.AddCip1852Tree.add(
//       super.getDb(), tx,
//       {
//         derivationId: pubDeriver.KeyDerivationId,
//         children: body.tree,
//       },
//       this.getCip1852Parent().getPublicDeriverLevel(),
//     );
//     const asDisplayCutoffInstance = asDisplayCutoff(this);
//     if (asDisplayCutoffInstance != null) {
//       await updateCutoffFromInsert(
//         tx,
//         {
//           GetPathWithSpecific: deps.GetPathWithSpecific,
//           GetCip1852DerivationSpecific: deps.GetCip1852DerivationSpecific,
//           GetDerivationsByPath: deps.GetDerivationsByPath,
//           ModifyDisplayCutoff: deps.ModifyDisplayCutoff,
//         },
//         {
//           publicDeriverLevel: this.getCip1852Parent().getPublicDeriverLevel(),
//           displayCutoffInstance: asDisplayCutoffInstance,
//           tree: body.tree,
//         }
//       );
//     }
//   }
//   addCip1852FromPublic = async (
//     body: IAddCip1852FromPublicRequest,
//   ): Promise<IAddCip1852FromPublicResponse> => {
//     const deps = Object.freeze({
//       GetPublicDeriver,
//       AddCip1852Tree,
//       ModifyDisplayCutoff,
//       GetDerivationsByPath,
//       GetPathWithSpecific,
//       GetCip1852DerivationSpecific,
//     });
//     const depTables = Object
//       .keys(deps)
//       .map(key => deps[key])
//       .flatMap(table => getAllSchemaTables(super.getDb(), table));
//     return await raii<IAddCip1852FromPublicResponse>(
//       super.getDb(),
//       depTables,
//       async tx => this.rawAddCip1852FromPublic(tx, deps, body)
//     );
//   }
// };
// const AddCip1852FromPublic = Mixin<
//   AddCip1852FromPublicDependencies,
//   IAddCip1852FromPublic,
// >(AddCip1852FromPublicMixin);
// const AddCip1852FromPublicInstance = (
//   (AddCip1852FromPublic: any): ReturnType<typeof AddCip1852FromPublicMixin>
// );
// export function asAddCip1852FromPublic<T: IPublicDeriver>(
//   obj: T
// ): void | (IAddCip1852FromPublic & AddCip1852FromPublicDependencies & T) {
//   if (obj instanceof AddCip1852FromPublicInstance) {
//     return obj;
//   }
//   return undefined;
// }
