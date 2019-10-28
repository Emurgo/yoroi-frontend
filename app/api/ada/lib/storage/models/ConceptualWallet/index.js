// @flow

import type {
  lf$Database,
} from 'lovefield';

import type {
  IConceptualWallet, IConceptualWalletConstructor, WalletType
} from './interfaces';
import { WalletTypeOption, } from './interfaces';

import {
  getAllSchemaTables,
  raii,
  StaleStateError,
} from '../../database/utils';

import type {
  IRename, IRenameRequest, IRenameResponse,
} from '../common/interfaces';
import { ModifyConceptualWallet, } from '../../database/wallet/api/write';
import type { HwWalletMetaRow, ConceptualWalletRow } from '../../database/wallet/tables';
import { GetConceptualWallet, GetHwWalletMeta } from '../../database/wallet/api/read';
import Config from '../../../../../../config';

/** Snapshot of a ConceptualWallet in the database */
export class ConceptualWallet implements IConceptualWallet, IRename {
  /**
   * Should only cache information we know will never change
   */

  db: lf$Database;
  #conceptualWalletId: number;
  walletType: WalletType;
  hardwareInfo: ?$ReadOnly<HwWalletMetaRow>;

  constructor(data: IConceptualWalletConstructor): IConceptualWallet {
    this.db = data.db;
    this.#conceptualWalletId = data.conceptualWalletId;
    this.walletType = data.walletType;
    this.hardwareInfo = data.hardwareInfo;
    return this;
  }

  getDb(): lf$Database {
    return this.db;
  }

  getConceptualWalletId(): number {
    return this.#conceptualWalletId;
  }

  getWalletType = (): WalletType => {
    return this.walletType;
  }
  /**
   * TODO: maybe  we shouldn't cache in this way
   * since information like device ID, firmware version, etc.
   * can change every time the user uses the HW wallet
   */
  getHwWalletMeta = (): ?$ReadOnly<HwWalletMetaRow> => {
    return this.hardwareInfo;
  }

  rename = async (
    body: IRenameRequest,
  ): Promise<IRenameResponse> => {
    const deps = Object.freeze({
      ModifyConceptualWallet,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.db, table));
    return await raii<IRenameResponse>(
      this.db,
      depTables,
      async tx => {
        await deps.ModifyConceptualWallet.rename(
          this.db, tx,
          {
            walletId: this.#conceptualWalletId,
            newName: body.newName,
          }
        );
      }
    );
  }

  getFullConceptualWalletInfo = async (): Promise<$ReadOnly<ConceptualWalletRow>> => {
    const deps = Object.freeze({
      GetConceptualWallet,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.db, table));
    return await raii(
      this.db,
      depTables,
      async tx => {
        const row = await deps.GetConceptualWallet.get(
          this.db, tx,
          this.#conceptualWalletId,
        );
        if (row == null) {
          throw new StaleStateError('getFullConceptualWalletInfo ConceptualWallet==null');
        }
        return row;
      }
    );
  }
}

function isHwKind(
  conceptualWallet: IConceptualWallet,
  matchKind: ($ReadOnly<HwWalletMetaRow>) => boolean,
): boolean {
  const typeMatch = conceptualWallet.getWalletType() === WalletTypeOption.HARDWARE_WALLET;
  if (!typeMatch) {
    return false;
  }
  const hwWalletMeta = conceptualWallet.getHwWalletMeta();
  if (hwWalletMeta == null) {
    return false;
  }
  return matchKind(hwWalletMeta);
}
export function isTrezorTWallet(
  conceptualWallet: IConceptualWallet,
): boolean {
  const tVendor = Config.wallets.hardwareWallet.trezorT.VENDOR;
  const tModel = Config.wallets.hardwareWallet.trezorT.MODEL;
  return isHwKind(
    conceptualWallet,
    (hwWalletMeta) => hwWalletMeta.Vendor === tVendor && hwWalletMeta.Model === tModel
  );
}
export function isLedgerNanoWallet(
  conceptualWallet: IConceptualWallet,
): boolean {
  const vendor = Config.wallets.hardwareWallet.ledgerNano.VENDOR;
  return isHwKind(
    conceptualWallet,
    (hwWalletMeta) => hwWalletMeta.Vendor === vendor
  );
}

export async function refreshConceptualWalletFunctionality(
  db: lf$Database,
  conceptualWalletId: number,
): Promise<IConceptualWalletConstructor> {
  const deps = Object.freeze({
    GetHwWalletMeta,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  const hardwareInfo = await raii<void | $ReadOnly<HwWalletMetaRow>>(
    db,
    depTables,
    async tx => await deps.GetHwWalletMeta.getMeta(
      db, tx,
      conceptualWalletId,
    )
  );
  const walletType = hardwareInfo == null
    ? WalletTypeOption.WEB_WALLET
    : WalletTypeOption.HARDWARE_WALLET;

  return {
    db,
    conceptualWalletId,
    walletType,
    hardwareInfo,
  };
}
