// @flow

import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';

/**
 * @param witnessSetHex1 - a serialised witness set as a HEX string
 * @param witnessSetHex2 - a serialised witness set as a HEX string
 * @return the resulting new witness set as a HEX string
 */
export function mergeWitnessSets(
  witnessSetHex1: string,
  witnessSetHex2: string,
): string {
  return RustModule.WasmScope(Scope => {
    const wset1 = Scope.WalletV4.TransactionWitnessSet.from_hex(witnessSetHex1);
    const wset2 = Scope.WalletV4.TransactionWitnessSet.from_hex(witnessSetHex2);
    const wsetResult = Scope.WalletV4.TransactionWitnessSet.new();
    let vkeys = wset1.vkeys();
    const newVkeys = wset2.vkeys();
    if (vkeys && newVkeys) {
      for (let i = 0; i < newVkeys.len(); i++) {
        vkeys.add(newVkeys.get(i));
      }
    } else if (newVkeys) {
      vkeys = newVkeys;
    }
    if (vkeys) {
      wsetResult.set_vkeys(vkeys);
    }

    let nativeScripts = wset1.native_scripts();
    const newNativeScripts = wset2.native_scripts();
    if (nativeScripts && newNativeScripts) {
      for (let i = 0; i < newNativeScripts.len(); i++) {
        nativeScripts.add(newNativeScripts.get(i));
      }
    } else if (newNativeScripts) {
      nativeScripts = newNativeScripts;
    }
    if (nativeScripts) {
      wsetResult.set_native_scripts(nativeScripts);
    }

    let bootstraps = wset1.bootstraps();
    const newBootstraps = wset2.bootstraps();
    if (bootstraps && newBootstraps) {
      for (let i =0; i < newBootstraps.len(); i++) {
        bootstraps.add(newBootstraps.get(i));
      }
    } else if (newBootstraps) {
      bootstraps = newBootstraps;
    }
    if (bootstraps) {
      wsetResult.set_bootstraps(bootstraps);
    }

    let plutusScripts = wset1.plutus_scripts();
    const newPlutusScripts = wset2.plutus_scripts();
    if (plutusScripts && newPlutusScripts) {
      for (let i = 0; i < newPlutusScripts.len(); i++) {
        plutusScripts.add(newPlutusScripts.get(i));
      }
    } else if (newPlutusScripts) {
      plutusScripts = newPlutusScripts;
    }
    if (plutusScripts) {
      wsetResult.set_plutus_scripts(plutusScripts);
    }

    let plutusData = wset1.plutus_data();
    const newPlutusData = wset2.plutus_data();
    if (plutusData && newPlutusData) {
      for (let i = 0; i < newPlutusData.len(); i++) {
        plutusData.add(newPlutusData.get(i));
      }
    } else if (newPlutusData) {
      plutusData = newPlutusData;
    }
    if (plutusData) {
      wsetResult.set_plutus_data(plutusData);
    }

    let redeemers = wset1.redeemers();
    const newRedeemers = wset2.redeemers();
    if (redeemers && newRedeemers) {
      for (let i = 0; i < newRedeemers.len(); i++) {
        redeemers.add(newRedeemers.get(i));
      }
    } else if (newRedeemers) {
      redeemers = newRedeemers;
    }
    if (redeemers) {
      wsetResult.set_redeemers(redeemers);
    }
    return wsetResult.to_hex();
  });
}