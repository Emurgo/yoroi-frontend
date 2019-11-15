// @flow

import type {
  lf$Database
} from 'lovefield';
import type { HwWalletMetaRow } from '../../database/walletTypes/core/tables';

export const WalletTypeOption = Object.freeze({
  WEB_WALLET: 0,
  HARDWARE_WALLET: 1
});
export type WalletType = $Values<typeof WalletTypeOption>;

export type IConceptualWalletConstructor = {|
  db: lf$Database,
  conceptualWalletId: number,
  walletType: WalletType,
  hardwareInfo: ?$ReadOnly<HwWalletMetaRow>,
|};

export interface IConceptualWallet {
  constructor(data: IConceptualWalletConstructor): IConceptualWallet;
  getWalletType(): WalletType;
  getHwWalletMeta(): ?$ReadOnly<HwWalletMetaRow>;
  getDb(): lf$Database;
  getConceptualWalletId(): number;
  getProtocolMagic(): string;
}
