
// @flow

import type {
  lf$Database, lf$Transaction,
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
import { ModifyConceptualWallet, } from '../../database/walletTypes/core/api/write';
import type { HwWalletMetaRow, ConceptualWalletRow } from '../../database/walletTypes/core/tables';
import { GetConceptualWallet } from '../../database/walletTypes/core/api/read';
import Config from '../../../../../../config';
import type {
  NetworkRow, TokenRow,
} from '../../database/primitives/tables';
import type { DefaultTokenEntry } from '../../../../../common/lib/MultiToken';
import { MultiToken } from '../../../../../common/lib/MultiToken';
import { Bip44TableMap } from '../../database/walletTypes/bip44/api/utils';

/** Snapshot of a ConceptualWallet in the database */
export class ConceptualWallet implements IConceptualWallet, IRename {
  /**
   * Should only cache information we know will never change
   */

  db: lf$Database;
  #conceptualWalletId: number;
  #publicDeriverLevel: number;
  #privateDeriverLevel: number | null;
  #privateDeriverKeyDerivationId: number | null;
  #signingLevel: number | null;
  walletType: WalletType;
  hardwareInfo: ?$ReadOnly<HwWalletMetaRow>;
  networkInfo: $ReadOnly<NetworkRow>;
  defaultToken: $ReadOnly<TokenRow>;

  constructor(
    data: IConceptualWalletConstructor,
    publicDeriverLevel: number,
    signingLevel: number | null,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
  ): IConceptualWallet {
    this.db = data.db;
    this.#conceptualWalletId = data.conceptualWalletId;
    this.#publicDeriverLevel = publicDeriverLevel;
    this.#privateDeriverLevel = privateDeriverLevel;
    this.#privateDeriverKeyDerivationId = privateDeriverKeyDerivationId;
    this.#signingLevel = signingLevel;
    this.walletType = data.walletType;
    this.hardwareInfo = data.hardwareInfo;
    this.networkInfo = data.networkInfo;
    this.defaultToken = data.defaultToken;
    return this;
  }

  getDb(): lf$Database {
    return this.db;
  }

  getPublicDeriverLevel(): number {
    return this.#publicDeriverLevel;
  }

  getPrivateDeriverLevel(): number | null {
    return this.#privateDeriverLevel;
  }

  getPrivateDeriverKeyDerivationId(): number | null {
    return this.#privateDeriverKeyDerivationId;
  }

  getDerivationTables: void => Map<number, string> = () => {
    // recall: cip1852 is an extension of bip44 so the tables are the same
    return Bip44TableMap;
  }

  getSigningLevel(): number | null {
    return this.#signingLevel;
  }

  getNetworkInfo(): $ReadOnly<NetworkRow> {
    return this.networkInfo;
  }

  getDefaultToken(): DefaultTokenEntry {
    return {
      defaultNetworkId: this.networkInfo.NetworkId,
      defaultIdentifier: this.defaultToken.Identifier,
    };
  }

  getDefaultMultiToken(): MultiToken {
    return new MultiToken([], this.getDefaultToken());
  }

  getConceptualWalletId(): number {
    return this.#conceptualWalletId;
  }

  getWalletType: void => WalletType = () => {
    return this.walletType;
  }

  /**
   * TODO: maybe  we shouldn't cache in this way
   * since information like device ID, firmware version, etc.
   * can change every time the user uses the HW wallet
   */
  getHwWalletMeta: void => ?$ReadOnly<HwWalletMetaRow> = () => {
    return this.hardwareInfo;
  }

  rename: IRenameRequest => Promise<IRenameResponse> = async (body) => {
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

  getFullConceptualWalletInfo: void => Promise<$ReadOnly<ConceptualWalletRow>> = async () => {
    const deps = Object.freeze({
      GetConceptualWallet,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.db, table));
    return await raii<$ReadOnly<ConceptualWalletRow>>(
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

  rawRemove: (lf$Database, lf$Transaction) => Promise<void> = async (db, tx) => {
    await rawRemoveConceptualWallet(
      db, tx,
      this.getConceptualWalletId()
    );
  }
}

export async function rawRemoveConceptualWallet(
  db: lf$Database,
  tx: lf$Transaction,
  conceptualWalletId: number,
): Promise<void> {
  await ModifyConceptualWallet.remove(
    db, tx,
    [conceptualWalletId]
  );
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

export const isAnyTrezorWallet = (
  conceptualWallet: IConceptualWallet,
): boolean => {
  return isTrezorTWallet(conceptualWallet)
    || isTrezorSafe3Wallet(conceptualWallet)
    || isTrezorSafe5Wallet(conceptualWallet);
};

function isTrezorTWallet(
  conceptualWallet: IConceptualWallet,
): boolean {
  const tVendor = Config.wallets.hardwareWallet.trezorT.VENDOR;
  const tModel = Config.wallets.hardwareWallet.trezorT.MODEL;
  return isHwKind(
    conceptualWallet,
    (hwWalletMeta) => hwWalletMeta.Vendor === tVendor && hwWalletMeta.Model === tModel
  );
}

function isTrezorSafe3Wallet(
  conceptualWallet: IConceptualWallet,
): boolean {
  const ts3Vendor = Config.wallets.hardwareWallet.trezorSafe3.VENDOR;
  const ts3Model = Config.wallets.hardwareWallet.trezorSafe3.MODEL;
  return isHwKind(
    conceptualWallet,
    (hwWalletMeta) => hwWalletMeta.Vendor === ts3Vendor && hwWalletMeta.Model === ts3Model
  );
}

function isTrezorSafe5Wallet(
  conceptualWallet: IConceptualWallet,
): boolean {
  const ts5Vendor = Config.wallets.hardwareWallet.trezorSafe5.VENDOR;
  const ts5Model = Config.wallets.hardwareWallet.trezorSafe5.MODEL;
  return isHwKind(
    conceptualWallet,
    (hwWalletMeta) => hwWalletMeta.Vendor === ts5Vendor && hwWalletMeta.Model === ts5Model
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
