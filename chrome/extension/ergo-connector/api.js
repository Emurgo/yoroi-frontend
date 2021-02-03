// @flow

import type {
  Address,
  Box,
  Tx,
  TxId,
  SignedTx
} from './types';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import type {
  IPublicDeriver
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  PublicDeriver,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
  asHasLevels,
  asGetSigningKey,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import BigNumber from 'bignumber.js';
import { BIP32PrivateKey, } from '../../../app/api/common/lib/crypto/keys/keyRepository';
import { generateKeys } from '../../../app/api/ergo/lib/transactions/utxoTransaction';

import {
  InvalidWitnessError,
  SendTransactionApiError
} from '../../../app/api/common/errors';

import axios from 'axios';

import type { UtxoTxOutput } from '../../../app/api/ada/lib/storage/database/transactionModels/utxo/api/read';

import { CoreAddressTypes } from '../../../app/api/ada/lib/storage/database/primitives/enums';
import { getAllAddressesForDisplay } from '../../../app/api/ada/lib/storage/bridge/traitUtils';


export async function connectorGetBalance(
  wallet: PublicDeriver<>,
  tokenId: string
): Promise<BigNumber> {
  if (tokenId === 'ERG') {
    const canGetBalance = asGetBalance(wallet);
    if (canGetBalance != null) {
      const balance = await canGetBalance.getBalance();
      return Promise.resolve(balance.getDefault());
    }
    throw Error('asGetBalance failed in connectorGetBalance');
  } else {
    // TODO: handle filtering by currency
    return Promise.resolve(new BigNumber(5));
  }
}

function formatUtxoToBox(utxo: { output: $ReadOnly<UtxoTxOutput>, ... }): Box {
    const tx = utxo.output.Transaction;
    const box = utxo.output.UtxoTransactionOutput;
    const tokens = utxo.output.tokens;
    // This doesn't seem right - is there a better way to access this?
    // Or a function that does this for us?
    // TODO: process other tokens too
    const token = tokens.find(t => t.TokenList.ListId === box.TokenListId);
    if (
      token == null ||
      box.ErgoCreationHeight == null ||
      box.ErgoBoxId == null ||
      box.ErgoTree == null
    ) {
      throw new Error('missing Ergo fields for Ergo UTXO');
    }
    return {
      boxId: box.ErgoBoxId,
      ergoTree: box.ErgoTree,
      assets: [],
      additionalRegisters: {},
      creationHeight: box.ErgoCreationHeight,
      transactionId: tx.Hash,
      index: box.OutputIndex,
      value: parseInt(token.TokenList.Amount, 10)
    };
}

export async function connectorGetUtxos(
  wallet: PublicDeriver<>,
  valueExpected: ?number
): Promise<Box[]> {
  const withUtxos = asGetAllUtxos(wallet);
  if (withUtxos == null) {
    throw new Error('wallet doesn\'t support IGetAllUtxos');
  }
  const utxos = await withUtxos.getAllUtxos();
  // TODO: more intelligently choose values?
  let utxosToUse = [];
  if (valueExpected != null) {
    // TODO: use bigint/whatever yoroi uses for values
    let valueAcc = 0;
    for (let i = 0; i < utxos.length && valueAcc < valueExpected; i += 1) {
      const formatted = formatUtxoToBox(utxos[i]);
      // eslint-disable-next-line no-console
      console.log(`get_utxos[1]: at ${valueAcc} of ${valueExpected} requested - trying to add ${formatted.value}`);
      valueAcc += parseInt(formatted.value, 10);
      utxosToUse.push(formatted);
      // eslint-disable-next-line no-console
      console.log(`get_utxos[2]: at ${valueAcc} of ${valueExpected} requested`);
    }
  } else {
    utxosToUse = utxos.map(formatUtxoToBox);
  }
  return Promise.resolve(utxosToUse);
}

async function getAllAddresses(wallet: PublicDeriver<>, usedFilter: boolean): Promise<Address[]> {
  const p2pk = getAllAddressesForDisplay({
    publicDeriver: wallet,
    type: CoreAddressTypes.ERGO_P2PK
  });
  const p2sh = getAllAddressesForDisplay({
    publicDeriver: wallet,
    type: CoreAddressTypes.ERGO_P2SH
  });
  const p2s = getAllAddressesForDisplay({
    publicDeriver: wallet,
    type: CoreAddressTypes.ERGO_P2S
  });
  await RustModule.load();
  const addresses = (await Promise.all([p2pk, p2sh, p2s]))
    .flat()
    .filter(a => a.isUsed === usedFilter)
    .map(a => RustModule.SigmaRust.NetworkAddress
        .from_bytes(Buffer.from(a.address, 'hex'))
        .to_base58());
  return addresses;
}

export async function connectorGetUsedAddresses(wallet: PublicDeriver<>): Promise<Address[]> {
  return getAllAddresses(wallet, true);
}

export async function connectorGetUnusedAddresses(wallet: PublicDeriver<>): Promise<Address[]> {
  return getAllAddresses(wallet, false);
}

export async function connectorSignTx(
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  password: string,
  utxos: any/* IGetAllUtxosResponse */,
  tx: Tx,
  indices: Array<number>
): Promise</* SignedTx */any> {
  const withLevels = asHasLevels(publicDeriver);
  if (withLevels == null) {
    throw new Error('wallet doesn\'t support levels');
  }
  const wallet = asGetSigningKey(withLevels);
  if (wallet == null) {
    throw new Error('wallet doesn\'t support signing');
  }
  await RustModule.load();
  let wasmTx;
  try {
    wasmTx = RustModule.SigmaRust.UnsignedTransaction.from_json(JSON.stringify(tx));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`tx parse error: ${e}`);
    throw e;
  }
  const boxIdsToSign = [];
  for (const index of indices) {
    const input = tx.inputs[index];
    boxIdsToSign.push(input.boxId);
  }

  const utxosToSign = utxos.filter(
    utxo => boxIdsToSign.includes(utxo.output.UtxoTransactionOutput.ErgoBoxId)
  );

  const signingKey = await wallet.getSigningKey();
  const normalizedKey = await wallet.normalizeKey({
    ...signingKey,
    password,
  });
  const finalSigningKey = BIP32PrivateKey.fromBuffer(
    Buffer.from(normalizedKey.prvKeyHex, 'hex')
  );
  const wasmKeys = generateKeys({
    senderUtxos: utxosToSign,
    keyLevel: wallet.getParent().getPublicDeriverLevel(),
    signingKey: finalSigningKey,
  });
  const x = utxosToSign.map(formatUtxoToBox);
  const txBoxesToSign = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(x);
  const signedTx = RustModule.SigmaRust.Wallet
    .from_secrets(wasmKeys)
    .sign_transaction(
      RustModule.SigmaRust.ErgoStateContext.dummy(), // TODO? Not implemented in sigma-rust
      wasmTx,
      txBoxesToSign,
      RustModule.SigmaRust.ErgoBoxes.from_boxes_json([]), // TODO: not supported by sigma-rust
    );
  return signedTx.to_json();
}

export async function connectorSendTx(
  wallet: IPublicDeriver</* ConceptualWallet */>,
  tx: SignedTx
): Promise<TxId> {
  const network = wallet.getParent().getNetworkInfo();
  const backend = network.Backend.BackendService;
  if (backend == null) {
    throw new Error('connectorSendTx: missing backend url');
  }
  return axios(
    `${backend}/api/txs/signed`,
    {
      method: 'post',
      // 2 * CONFIG.app.walletRefreshInterval,
      timeout: 2 * 20000,
      data: tx,
      // headers: {
      //   'yoroi-version': this.getLastLaunchVersion(),
      //   'yoroi-locale': this.getCurrentLocale()
      // }
    }
  ).then(response => {
    return Promise.resolve(response.data.id);
  })
    .catch((error) => {
      if (error.request.response.includes('Invalid witness')) {
        throw new InvalidWitnessError();
      }
      throw new SendTransactionApiError();
    });
}

// TODO: generic data sign
