// @flow
import type { HandlerType } from './type';
import { getPublicDeriverById } from './utils';
import {
  connectorSignCardanoTx,
  connectorRecordSubmittedCardanoTransaction,
} from '../../../connector/api';
import { mergeWitnessSets } from '../../../../../app/api/ada/transactions/utils';
import {
  transactionHexToHash,
  transactionHexReplaceWitnessSet,
  transactionHexToWitnessSet,
} from '../../../../../app/api/ada/lib/cardanoCrypto/utils';
import {
  asGetSigningKey,
  asGetAllAccounting,
} from '../../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import AdaApi, { genOwnStakingKey } from '../../../../../app/api/ada';
import { RustModule } from '../../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { emitUpdateToSubscriptions } from '../../subscriptionManager';
import LocalStorageApi from '../../../../../app/api/localStorage/index';
import { getCardanoStateFetcher } from '../../utils';
import { hexToBytes } from '../../../../../app/coreUtils';
import { getWalletsState  } from '../utils';
import type { CardanoAddressedUtxo } from '../../../../../app/api/ada/transactions/types';

export type SignTransactionRequestType = {|
  publicDeriverId: number,
  password: string,
  transactionHex: string
|};

export const SignTransaction: HandlerType<
  SignTransactionRequestType,
  string | {| error: string |}
> = Object.freeze({
  typeTag: 'sign-transaction',

  handle: async (request) => {
    const { publicDeriverId, password, transactionHex } = request;
    const publicDeriver = await getPublicDeriverById(publicDeriverId);
    try {
      const signedWitnessSetHex = await connectorSignCardanoTx(
        publicDeriver,
        password,
        {
          tx: transactionHex,
          tabId: -1,
          partialSign: false
        },
      );

      const mergedWitnessSetHex = mergeWitnessSets(
        transactionHexToWitnessSet(transactionHex),
        signedWitnessSetHex,
      );
      return transactionHexReplaceWitnessSet(transactionHex, mergedWitnessSetHex);
    } catch (error) {
      return { error: error.name };
    }
  },
});


export type SignAndBroadcastTransactionRequestType = {|
  publicDeriverId: number,
  senderUtxos: Array<CardanoAddressedUtxo>,
  unsignedTx: string,
  metadata: ?string,
  neededHashes: Array<string>,
  wits: Array<string>,
  password: string,
  txHash: string,
|};
export const SignAndBroadcastTransaction: HandlerType<
  SignAndBroadcastTransactionRequestType,
 {| txId: string |} | {| error: string |}
> = Object.freeze({
  typeTag: 'sign-and-broadcast-transaction',

  handle: async (request) => {
    return RustModule.WasmScope(async (Scope) => {
      const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
      const { senderUtxos, unsignedTx, metadata, wits, neededHashes, txHash } = request;

      try {
        const withSigning = asGetSigningKey(publicDeriver);
        if (withSigning == null) {
          throw new Error('unexpected missing asGetSigningKey result');
        }

        if (neededHashes.length - wits.length >= 2) {
          throw new Error('Too many missing witnesses');
        }
        if (neededHashes.length !== wits.length) {
          const withStakingKey = asGetAllAccounting(withSigning);
          if (withStakingKey == null) {
            throw new Error('unexpected missing asGetAllAcccounting result');
          }
          const stakingKey = await genOwnStakingKey({
            publicDeriver: withStakingKey,
            password: request.password,
          });
          if (neededHashes.includes(
            Buffer.from(
              Scope.WalletV4.Credential.from_keyhash(
                stakingKey.to_public().hash()
              ).to_bytes()
            ).toString('hex')
          )) {
            wits.push(
              Buffer.from(Scope.WalletV4.make_vkey_witness(
                Scope.WalletV4.TransactionHash.from_hex(txHash),
                stakingKey
              ).to_bytes()).toString('hex')
            );
          } else {
            throw new Error('missing witness but it was not ours');
          }
        }

        const unsignedTxWasm = RustModule.WalletV4.Transaction.from_hex(unsignedTx);

        const signRequest = {
          senderUtxos,
          unsignedTx: unsignedTxWasm,
          metadata: metadata ? Scope.WalletV4.AuxiliaryData.from_hex(metadata) : undefined,
          neededStakingKeyHashes: {
            wits: new Set(wits),
          },
        };
        const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());
        const adaApi = new AdaApi();
        const { txId, signedTxHex, } = await adaApi.signAndBroadcast({
          publicDeriver: withSigning,
          password: request.password,
          signRequest,
          sendTx: stateFetcher.sendTx,
        });

        unsignedTxWasm.free();

        try {
          await connectorRecordSubmittedCardanoTransaction(
            publicDeriver,
            Scope.WalletV4.Transaction.from_hex(signedTxHex)
          );
        } catch (_error) {
          // ignore
        }
        emitUpdateForTxSubmission(request.publicDeriverId);
        return { txId };
      } catch (error) {
        return { error: error.name };
      }
    });
  },
});

export type BroadcastTransactionRequestType = {|
  publicDeriverId: number,
  ...({|
    signedTxHexArray: Array<string>,
  |} | {|
    addressedUtxos?: Array<CardanoAddressedUtxo>,
    signedTxHex: string,
  |})
|};

export const BroadcastTransaction: HandlerType<
  BroadcastTransactionRequestType,
  null | {| error: string |}
> = Object.freeze({
  typeTag: 'broadcast-transaction',

  handle: async (request) => {
    const publicDeriver = await getPublicDeriverById(request.publicDeriverId);
    let txs;
    let addressedUtxoArray;
    if (request.signedTxHexArray) {
      txs = request.signedTxHexArray.map(txHex => ({
        id: transactionHexToHash(txHex),
        encodedTx: hexToBytes(txHex),
      }));
      addressedUtxoArray = [];
    } else {
      const { signedTxHex, addressedUtxos } = request;
      if (typeof signedTxHex !== 'string') {
        throw new Error('unexpected missing `signedTxHex` in request');
      }
      txs = [{ id: transactionHexToHash(signedTxHex), encodedTx: hexToBytes(signedTxHex) }];
      addressedUtxoArray = [addressedUtxos];
    }

    const stateFetcher = await getCardanoStateFetcher(new LocalStorageApi());
    try {
      await stateFetcher.sendTx({
        network: publicDeriver.getParent().getNetworkInfo(),
        txs,
      });
      try {
        for (let i = 0; i < txs.length; i++) {
          await RustModule.WasmScope(Scope => connectorRecordSubmittedCardanoTransaction(
            publicDeriver,
            Scope.WalletV4.Transaction.from_bytes(txs[i].encodedTx),
            addressedUtxoArray[i]
          ));
        }
      } catch (_error) {
        // ignore
      }
      emitUpdateForTxSubmission(request.publicDeriverId);
      return null;
    } catch (error) {
      return { error: error.message };
    }
  },
});

function emitUpdateForTxSubmission(publicDeriverId: number) {
  (async () => {
    emitUpdateToSubscriptions({
      type: 'wallet-state-update',
      params: {
        eventType: 'update',
        publicDeriverId,
        isRefreshing: false,
        walletState: (await getWalletsState(publicDeriverId))[0],
        newTxs: [],
      },
    });
  })().catch(console.error)
}
