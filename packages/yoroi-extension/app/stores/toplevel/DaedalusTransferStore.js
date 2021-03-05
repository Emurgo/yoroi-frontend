// @flow
import { observable, action, runInAction } from 'mobx';
import { defineMessages } from 'react-intl';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type { ConfigType } from '../../../config/config-types';
import LocalizableError, {
  localizedError
} from '../../i18n/LocalizableError';
import type {
  TransferStatusT,
  TransferTx
} from '../../types/TransferTypes';
import { TransferStatus } from '../../types/TransferTypes';
import {
  getAddressesKeys,
} from '../../api/ada/transactions/transfer/legacyDaedalus';
import type { SendFunc } from '../../api/ada/lib/state-fetch/types';
import {
  getCryptoDaedalusWalletFromMnemonics,
  getCryptoDaedalusWalletFromMasterKey
} from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { getApiForNetwork } from '../../api/common/utils';
import type { AddressKeyMap } from '../../api/ada/transactions/types';
import { isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { normalizeToBase58 } from '../../api/ada/lib/storage/bridge/utils';
import type {
  Address, Addressing
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { getReceiveAddress } from '../stateless/addressStores';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const MSG_TYPE_RESTORE = 'RESTORE';
const WS_CODE_NORMAL_CLOSURE = 1000;

export type BuildTxFunc = {|
  addressKeys: AddressKeyMap,
  outputAddr: {| ...Address, ...InexactSubset<Addressing> |},
|} => Promise<TransferTx>;

export default class DaedalusTransferStore extends Store<StoresMap, ActionsMap> {

  @observable status: TransferStatusT = TransferStatus.UNINITIALIZED;
  @observable error: ?LocalizableError = null;
  @observable transferTx: ?TransferTx = null;

  // careful: this is a global request and not per-wallet or per-currency
  @observable transferFundsRequest: Request<SendFunc> = new Request<SendFunc>(request => {
    const network = this.stores.profile.selectedNetwork;
    if (network == null) throw new Error(`${nameof(DaedalusTransferStore)} transfer tx no selected network`);
    const selectedApiType = getApiForNetwork(network);
    if (!this.stores.substores[selectedApiType].daedalusTransfer) {
      throw new Error(`${nameof(DaedalusTransferStore)} transfer tx currency doesn't support Daedalus transfer`);
    }

    return this.stores.substores[selectedApiType].stateFetchStore.fetcher.sendTx(request);
  });

  @observable ws: ?WebSocket = null;

  setup(): void {
    super.setup();
    const actions = this.actions.daedalusTransfer;
    actions.startTransferFunds.listen(this._startTransferFunds);
    actions.startTransferPaperFunds.listen(this._startTransferPaperFunds);
    actions.startTransferMasterKey.listen(this._startTransferMasterKey);
    actions.setupTransferFundsWithMnemonic.listen(this._setupTransferFundsWithMnemonic);
    actions.setupTransferFundsWithMasterKey.listen(this._setupTransferFundsWithMasterKey);
    actions.backToUninitialized.listen(this._backToUninitialized);
    actions.transferFunds.listen(this._transferFunds);
    actions.cancelTransferFunds.listen(this._reset);
  }

  teardown(): void {
    super.teardown();
    this._reset();
  }

  _startTransferFunds: void => void = () => {
    this._updateStatus(TransferStatus.GETTING_MNEMONICS);
  }

  _startTransferPaperFunds: void => void = () => {
    this._updateStatus(TransferStatus.GETTING_PAPER_MNEMONICS);
  }

  _startTransferMasterKey: void => void = () => {
    this._updateStatus(TransferStatus.GETTING_MASTER_KEY);
  }

  /**
   * Call the backend service to fetch all the UTXO then find which belong to the Daedalus wallet.
   * Finally, generate the tx to transfer the wallet to Yoroi
   */
  _setupTransferWebSocket: (
    RustModule.WalletV2.DaedalusWallet,
    PublicDeriver<>,
  ) => Promise<void> = async (
    wallet,
    publicDeriver,
  ) => {
    const nextInternal = await getReceiveAddress(publicDeriver);
    if (nextInternal == null) {
      throw new Error(`${nameof(this._setupTransferWebSocket)} no internal addresses left. Should never happen`);
    }
    const nextInternalAddress = {
      address: nextInternal.addr.Hash,
      addressing: nextInternal.addressing,
    };

    this._updateStatus(TransferStatus.RESTORING_ADDRESSES);

    const websocketUrl = publicDeriver.getParent().getNetworkInfo().Backend.WebSocket;
    if (websocketUrl == null) throw new Error(`${nameof(this._setupTransferWebSocket)} no websocket backend for wallet`);
    runInAction(() => {
      this.ws = new WebSocket(websocketUrl);
    });
    if (!this.ws) { throw new Error('Invalid WebSocket'); }
    const ws = this.ws; // assert non-null

    ws.addEventListener('open', () => {
      Logger.info('[ws::connected]');
      if (!this.ws) { throw new Error('Invalid WebSocket'); }
      this.ws.send(JSON.stringify({
        msg: MSG_TYPE_RESTORE,
      }));
    });
    /*  TODO: Remove 'any' from event
        There is an open issue with this https://github.com/facebook/flow/issues/3116
    */
    ws.addEventListener('message', async (event: any) => {
      try {
        // Note: we only expect a single message from our WS so we can close it right away.
        // Not closing it right away will cause a WS timeout as we don't keep the connection alive.
        if (!this.ws) { throw new Error('Invalid WebSocket'); }
        this.ws.close(WS_CODE_NORMAL_CLOSURE);

        const data: {
          addresses: Array<string>,
          msg: string,
          ...,
        } = JSON.parse(event.data);
        Logger.info(`[ws::message] on: ${data.msg}`);
        if (data.msg === MSG_TYPE_RESTORE) {
          this._updateStatus(TransferStatus.CHECKING_ADDRESSES);
          const checker = RustModule.WalletV2.DaedalusAddressChecker.new(wallet);

          const fullUtxo = isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())
            // no server-side filtering for address type so we instead filter here
            // additionally, need to normalize backend response to base58
            ? data.addresses.reduce(
              (addrs, addr) => {
                const normalized = normalizeToBase58(addr);
                if (normalized == null) return addrs;
                addrs.push(normalized);
                return addrs;
              },
              ([]: Array<string>)
            )
            : data.addresses; // Jormungandr filtered server-side

          const addressKeys = getAddressesKeys({ checker, fullUtxo });
          this._updateStatus(TransferStatus.GENERATING_TX);

          const selectedApiType = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());
          if (!this.stores.substores[selectedApiType].daedalusTransfer) {
            throw new Error(`${nameof(DaedalusTransferStore)}::${nameof(this._setupTransferWebSocket)} currency doesn't support Daedalus transfer`);
          }
          const transferTx = await this.stores.substores[selectedApiType].daedalusTransfer.buildTx({
            addressKeys,
            outputAddr: nextInternalAddress,
          });
          runInAction(() => {
            this.transferTx = transferTx;
          });
          this._updateStatus(TransferStatus.READY_TO_TRANSFER);
        }
      } catch (error) {
        Logger.error(`${nameof(DaedalusTransferStore)}::${nameof(this._setupTransferWebSocket)} ${stringifyError(error)}`);
        runInAction(() => {
          this.status = TransferStatus.ERROR;
          this.error = localizedError(error);
        });
      }
    });

    if (!this.ws) { throw new Error('Invalid WebSocket'); }
    this.ws.addEventListener('close', (event: any) => {
      if (event.code !== WS_CODE_NORMAL_CLOSURE) {
        // if connection was not closed normally, we log this as an error. Otherwise it's an info
        Logger.error(
          `[ws::close] CODE: ${event.code} - REASON: ${event.reason} - was clean? ${event.wasClean}`
        );

        runInAction(() => {
          this.status = TransferStatus.ERROR;
          this.error = new WebSocketRestoreError();
        });
      } else {
        Logger.info(
          `[ws::close] CODE: ${event.code} - REASON: ${event.reason} - was clean? ${event.wasClean}`
        );
      }
    });
  };

  _setupTransferFundsWithMnemonic: {|
    recoveryPhrase: string,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (payload) => {
    let { recoveryPhrase: secretWords } = payload;
    if (secretWords.split(' ').length === 27) {
      const [newSecretWords, unscrambledLen] =
        await this.api.ada.unscramblePaperMnemonic({
          mnemonic: secretWords,
          numberOfWords: 27
        });
      if (newSecretWords == null || !unscrambledLen) {
        throw new Error('Failed to unscramble paper mnemonics!');
      }
      secretWords = newSecretWords;
    }

    await this._setupTransferWebSocket(
      getCryptoDaedalusWalletFromMnemonics(secretWords),
      payload.publicDeriver,
    );
  }

  _setupTransferFundsWithMasterKey: {|
    masterKey: string,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (payload) => {
    const { masterKey: key } = payload;

    await this._setupTransferWebSocket(
      getCryptoDaedalusWalletFromMasterKey(key),
      payload.publicDeriver,
    );
  }

  _backToUninitialized: void => void = () => {
    this._updateStatus(TransferStatus.UNINITIALIZED);
  }

  /** Updates the status that we show to the user as transfer progresses */
  @action.bound
  _updateStatus(s: TransferStatusT): void {
    this.status = s;
  }

  /** Broadcast the transfer transaction if one exists and proceed to continuation */
  _transferFunds: {|
    next: Function,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (payload) => {
    try {
      const { next } = payload;
      if (!this.transferTx) {
        throw new NoTransferTxError();
      }
      if (this.transferTx.id == null || this.transferTx.encodedTx == null) {
        throw new Error(`${nameof(DaedalusTransferStore)} transaction not signed`);
      }
      const { id, encodedTx } = this.transferTx;
      await this.transferFundsRequest.execute({
        network: payload.publicDeriver.getParent().getNetworkInfo(),
        id,
        encodedTx,
      });
      next();
      this._reset();
    } catch (error) {
      Logger.error(`${nameof(DaedalusTransferStore)}::${nameof(this._transferFunds)} ${stringifyError(error)}`);
      if (error instanceof NoTransferTxError) {
        runInAction(() => {
          this.error = error;
        });
      } else {
        runInAction(() => {
          this.error = new TransferFundsError();
        });
      }
    }
  }

  @action.bound
  _reset(): void {
    this.status = TransferStatus.UNINITIALIZED;
    this.error = null;
    this.transferTx = null;
    this.transferFundsRequest.reset();
    if (this.ws) {
      this.ws.close(WS_CODE_NORMAL_CLOSURE);
      this.ws = null;
    }
  }
}

const messages = defineMessages({
  transferFundsError: {
    id: 'daedalusTransfer.error.transferFundsError',
    defaultMessage: '!!!Unable to transfer funds.',
  },
  noTransferTxError: {
    id: 'daedalusTransfer.error.noTransferTxError',
    defaultMessage: '!!!There is no transfer transaction to send.',
  },
  webSocketRestoreError: {
    id: 'daedalusTransfer.error.webSocketRestoreError',
    defaultMessage: '!!!Error while restoring blockchain addresses',
  }
});

export class TransferFundsError extends LocalizableError {
  constructor() {
    super({
      id: messages.transferFundsError.id,
      defaultMessage: messages.transferFundsError.defaultMessage || '',
      description: messages.transferFundsError.description,
    });
  }
}

export class NoTransferTxError extends LocalizableError {
  constructor() {
    super({
      id: messages.noTransferTxError.id,
      defaultMessage: messages.noTransferTxError.defaultMessage || '',
      description: messages.noTransferTxError.description,
    });
  }
}

export class WebSocketRestoreError extends LocalizableError {
  constructor() {
    super({
      id: messages.webSocketRestoreError.id,
      defaultMessage: messages.webSocketRestoreError.defaultMessage || '',
      description: messages.webSocketRestoreError.description,
    });
  }
}
