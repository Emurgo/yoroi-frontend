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
    broadcastRequest:
      | {|
          normal: {|
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              ...
            },
            signRequest: HaskellShelleyTxSignRequest,
            password: string,
          |},
        |}
      | {|
          trezor: {|
            signRequest: HaskellShelleyTxSignRequest,
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              publicKey: string,
              pathToPublic: Array<number>,
              stakingAddressing: Addressing,
              networkId: number,
              hardwareWalletDeviceId: ?string,
              ...
            },
          |},
        |}
      | {|
          ledger: {|
            signRequest: HaskellShelleyTxSignRequest,
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              stakingAddressing: Addressing,
              publicKey: string,
              pathToPublic: Array<number>,
              networkId: number,
              hardwareWalletDeviceId: ?string,
              ...
            }
          |},
        |},
    refreshWallet: () => Promise<void>,
  |}) => Promise<void> = async request => {
    let broadcastRequest;
    let publicDeriverId;
    let plateTextPart;

    if (request.broadcastRequest.ledger) {
      const { wallet, signRequest } = request.broadcastRequest.ledger;
      broadcastRequest = async () => {
        return await this.stores.substores.ada.ledgerSend.signAndBroadcastFromWallet({
          signRequest,
          wallet,
        });
      };
      publicDeriverId = wallet.publicDeriverId;
      plateTextPart = wallet.plate.TextPart;
    } else if (request.broadcastRequest.trezor) {
      const { wallet, signRequest } = request.broadcastRequest.trezor;
      broadcastRequest = async () => {
        return await this.stores.substores.ada.trezorSend.signAndBroadcastFromWallet({
          signRequest,
          wallet,
        });
      };
      publicDeriverId = request.broadcastRequest.trezor.wallet.publicDeriverId;
      plateTextPart = request.broadcastRequest.trezor.wallet.plate.TextPart;
    } else if (request.broadcastRequest.normal) {
      const { wallet, signRequest, password } = request.broadcastRequest.normal;
      broadcastRequest = async () => {
        return await this.stores.substores.ada.mnemonicSend.signAndBroadcast({
          signRequest,
          password,
          publicDeriverId: wallet.publicDeriverId,
        });
      };
      publicDeriverId = wallet.publicDeriverId;
      plateTextPart = wallet.plate.TextPart;
    } else {
      throw new Error(
        `${nameof(TransactionProcessingStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    };
    await this.sendAndRefresh({
      publicDeriverId,
      broadcastRequest,
      refreshWallet: request.refreshWallet,
      plateTextPart,
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
    const walletType: string = wallet.type;
    const baseSignRequest = { wallet, transactionHex };
    const signRequest = wallet.isHardware
      ? { [walletType]: baseSignRequest }
      : { normal: { ...baseSignRequest, password } };
    // $FlowIgnore[incompatible-call]
    return this.adaSignTransactionHex({ signRequest });
  }

  adaSignTransactionHex: ({|
    signRequest:
      | {|
          normal: {|
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              ...
            },
            transactionHex: string,
            password: string,
          |},
        |}
      | {|
          trezor: {|
            transactionHex: string,
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              publicKey: string,
              pathToPublic: Array<number>,
              stakingAddressing: Addressing,
              networkId: number,
              hardwareWalletDeviceId: ?string,
              ...
            },
          |},
        |}
      | {|
          ledger: {|
            transactionHex: string,
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              stakingAddressing: Addressing,
              publicKey: string,
              pathToPublic: Array<number>,
              networkId: number,
              hardwareWalletDeviceId: ?string,
              ...
            }
          |},
        |},
  |}) => Promise<{| signedTxHex: string |}> = async request => {
    if (request.signRequest.ledger) {
      const { wallet, transactionHex } = request.signRequest.ledger;
      return this.stores.substores.ada.ledgerSend
        .signRawTxFromWallet({ rawTxHex: transactionHex, wallet });
    }
    if (request.signRequest.trezor) {
      const { wallet, transactionHex } = request.signRequest.trezor;
      return this.stores.substores.ada.trezorSend
        .signRawTxFromWallet({ rawTxHex: transactionHex, wallet });
    }
    if (request.signRequest.normal) {
      const { wallet, transactionHex, password } = request.signRequest.normal;
      const signedTxHex = await signTransaction({
        publicDeriverId: wallet.publicDeriverId,
        transactionHex,
        password,
      });
      return { signedTxHex };
    }
    throw new Error(
      `${nameof(TransactionProcessingStore)}::${nameof(this.adaSignTransactionHex)} unhandled wallet type`
    );
  };
}
