// @flow
import Store from '../base/Store';
import type { StoresMap } from '../index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { signTransaction } from '../../api/thunk';
import type { Addressing } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { observable } from 'mobx';
import Request from '../lib/LocalizedRequest';
import { Logger, stringifyError } from '../../utils/logging';

export type SendMoneyRequest = Request<DeferredCall<{| txId: string |}>>;

export default class TransactionProcessingStore extends Store<StoresMap> {
  @observable sendMoneyRequest: SendMoneyRequest = new Request<
    DeferredCall<{| txId: string |}>
  >(request => request());

  sendAndRefresh: ({|
    publicDeriverId: void | number,
    plateTextPart: void | string,
    broadcastRequest: void => Promise<{| txId: string |}>,
    refreshWallet: () => Promise<void>,
  |}) => Promise<{| txId: string |}> = async request => {
    this.sendMoneyRequest.reset();
    const resp = await this.sendMoneyRequest.execute(async () => {
      const result = await request.broadcastRequest();

      if (request.publicDeriverId != null) {
        const memo = this.stores.transactionBuilderStore.memo;
        if (memo !== '' && memo !== undefined && request.plateTextPart) {
          try {
            await this.stores.memos.saveTxMemo({
              publicDeriverId: request.publicDeriverId,
              plateTextPart: request.plateTextPart,
              memo: {
                Content: memo,
                TransactionHash: result.txId,
                LastUpdated: new Date(),
              },
            });
          } catch (error) {
            Logger.error(
              `${nameof(TransactionProcessingStore)}::${nameof(this.sendAndRefresh)} error: ` +
                stringifyError(error)
            );
            throw new Error('An error has ocurred when saving the transaction memo.');
          }
        }
      }
      try {
        await request.refreshWallet();
      } catch (_e) {
        // even if refreshing the wallet fails, we don't want to fail the tx
        // otherwise user may try and re-send the tx
      }
      return result;
    }).promise;
    if (resp == null) throw new Error(`Should never happen`);
    return resp;
  };

  adaSendAndRefresh: ({|
    wallet: WalletState,
    signRequest: HaskellShelleyTxSignRequest,
    password: ?string,
    callback: () => Promise<void>,
  |}) => Promise<void> = async request => {
    const { wallet, signRequest, password, callback } = request;

    let broadcastRequest;
    if (wallet.type === 'ledger') {
      broadcastRequest = async () => {
        return await this.stores.substores.ada.ledgerSend.signAndBroadcastFromWallet({
          signRequest,
          wallet,
        });
      };
    } else if (wallet.type === 'trezor') {
      broadcastRequest = async () => {
        return await this.stores.substores.ada.trezorSend.signAndBroadcastFromWallet({
          signRequest,
          wallet,
        });
      };
    } else if (wallet.type === 'mnemonic') {
      if (!password) {
        throw new Error('missing password for hardware wallet');
      }
      broadcastRequest = async () => {
        return await this.stores.substores.ada.mnemonicSend.signAndBroadcast({
          signRequest,
          password,
          publicDeriverId: wallet.publicDeriverId,
        });
      };
    } else {
      throw new Error(
        `${nameof(TransactionProcessingStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    };
    await this.sendAndRefresh({
      publicDeriverId: wallet.publicDeriverId,
      broadcastRequest,
      refreshWallet: callback,
      plateTextPart: wallet.plate.TextPart,
    });
  };

  adaSignTransactionHexFromWallet: ({|
    transactionHex: string,
    +wallet: {
      publicDeriverId: number,
      +plate: { TextPart: string, ... },
      publicKey: string,
      pathToPublic: Array<number>,
      stakingAddressing: Addressing,
      networkId: number,
      hardwareWalletDeviceId: ?string,
      type: 'trezor' | 'ledger' | 'mnemonic',
      isHardware: boolean,
      ...
    },
    password: string,
  |}) => Promise<{| signedTxHex: string |}> = async ({ wallet, transactionHex, password }) => {
    let result;
    if (wallet.type === 'mnemonic') {
      const signedTxHex = await signTransaction({
        publicDeriverId: wallet.publicDeriverId,
        transactionHex,
        password,
      });
      result = { signedTxHex };
    } else if (wallet.type === 'trezor') {
      result = await this.stores.substores.ada.trezorSend.signRawTxFromWallet({
        rawTxHex: transactionHex,
        wallet,
        // by happenstance the use case of this function is not to send
        // money while getting the change so there is no change address
        changeAddrs: [],
      });
    } else if (wallet.type === 'ledger') {
      result = await this.stores.substores.ada.ledgerSend.signRawTxFromWallet({
        rawTxHex: transactionHex,
        wallet,
        // by happenstance the use case of this function is not to send
        // money while getting the change so there is no change address
        changeAddrs: [],
      });
    } else {
      throw new Error(
        `${nameof(TransactionProcessingStore)}::${nameof(this.adaSignTransactionHex)} unhandled wallet type`
      );
    }
    return { signedTxHex: result.signedTxHex };
  };
}
