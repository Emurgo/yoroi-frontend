// @flow

import Store from '../base/Store';
import BigNumber from 'bignumber.js';
import {
  daedalusTransferTxFromAddresses,
} from '../../api/ada/transactions/transfer/legacyDaedalus';
import type { BuildTxFunc } from '../toplevel/DaedalusTransferStore';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  genTimeToSlot,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

export default class AdaDaedalusTransferStore extends Store {

  buildTx: BuildTxFunc = async (request) => {
    const selectedNetwork = this.stores.profile.selectedNetwork;
    if (selectedNetwork == null) throw new Error(`${nameof(AdaDaedalusTransferStore)} transfer tx no selected network`);

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(AdaDaedalusTransferStore)}::${nameof(this.buildTx)} no network selected`);
    }
    const fullConfig = getCardanoHaskellBaseConfig(
      this.stores.profile.selectedNetwork
    );
    const config = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});

    // note: no wallet selected so we call this directly
    const toRelativeSlotNumber = await genTimeToSlot(fullConfig);

    return await daedalusTransferTxFromAddresses({
      addressKeys: request.addressKeys,
      outputAddr: request.outputAddr,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      protocolParams: {
        keyDeposit: RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
        linearFee: RustModule.WalletV4.LinearFee.new(
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
          RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
        ),
        minimumUtxoVal: RustModule.WalletV4.BigNum.from_str(config.minimumUtxoVal),
        poolDeposit: RustModule.WalletV4.BigNum.from_str(config.poolDeposit),
      },
      absSlotNumber: new BigNumber(toRelativeSlotNumber({ time: new Date() }).slot),
    });
  }
}
