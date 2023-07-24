// @flow

import type { Tx } from './types';
import type { TokenRow } from '../../../app/api/ada/lib/storage/database/primitives/tables';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';

export function parseEIP0004Data(
  input: any,
  log: string => void,
): ?string {
  // https://github.com/ergoplatform/eips/blob/master/eip-0004.md
  // format is: 0e + vlq(len(body as bytes)) + body (as bytes formatted in hex)
  // where body is a utf8 string
  // and the vlq encoding is also byte-padded e.g. 01 instead of 1
  if (typeof input !== 'string' || !input.startsWith('0e') || input.length < 4) {
    return null
  }
  let body = input.slice(2);
  let len = 0;
  let readNext = true;
  do {
    const lenChunk = parseInt(body.slice(0, 2), 16);
    body = body.slice(2);
    if (isNaN(lenChunk)) {
      return null;
    }
    readNext = (lenChunk & 0x80) !== 0;
    len = (128 * len) + (lenChunk & 0x7F);
  } while (readNext);
  if (2 * len > body.length) {
    log(`vlq decode trailing data: ${body.slice(2 * len)}`);
  }
  if (2 * len < body.length) {
    return null;
  }
  return Buffer.from(body.slice(0, 2 * len), 'hex').toString('utf8');
}

// you should not be able to mint more than 1
export function mintedTokenInfo(
  tx: Tx,
  log: string => void,
): $ReadOnly<TokenRow>[] {
  const tokens = []
  for (const output of tx.outputs) {
    const name = parseEIP0004Data(output.additionalRegisters.R4, log);
    const description = parseEIP0004Data(output.additionalRegisters.R5, log);
    const decimals = parseInt(
      parseEIP0004Data(output.additionalRegisters.R6, log) ?? '', 10
    );
    if (name != null && description != null && decimals != null) {
      tokens.push({
        TokenId: 0,
        NetworkId: 0,
        IsDefault: false,
        IsNFT: false,
        Digest: 0,
        Identifier: tx.inputs[0].boxId,
        Metadata: {
          type: 'Ergo',
          height: tx.inputs[0].creationHeight,
          boxId: tx.inputs[0].boxId,
          numberOfDecimals: isNaN(decimals) ? 0 : decimals,
          ticker: name,
          longName: description,
          description,
        }
      });
    }
  }
  if (tokens.length > 1) {
    log(`tx ${JSON.stringify(tx)} had multiple EIP-0004-looking outputs`);
  }
  return tokens;
}

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