// @flow

import BigNumber from 'bignumber.js';
import { observable, action, runInAction, reaction } from 'mobx';
import Store from '../base/Store';
import { Logger } from '../../utils/logging';
import { encryptWithPassword } from '../../utils/catalystCipher';
import LocalizedRequest from '../lib/LocalizedRequest';
import type { CreateVotingRegTxFunc } from '../../api/ada';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asHasUtxoChains,
  asGetSigningKey,
  asGetAllAccounting,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import { genTimeToSlot } from '../../api/ada/lib/storage/bridge/timeUtils';
import { generatePrivateKeyForCatalyst } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { genOwnStakingKey } from '../../api/ada/index';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

export default class VotingStore extends Store {
  @observable encryptedKey: ?string = null;
  @observable catalystPrivateKey: RustModule.WalletV4.PrivateKey;
  @observable pin: Array<number>;

  @observable
  createVotingRegTx: LocalizedRequest<CreateVotingRegTxFunc> = new LocalizedRequest<CreateVotingRegTxFunc>(
    this.api.ada.createVotingRegTx
  );

  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  // eslint-disable-next-line no-restricted-syntax
  _updateTxBuilderReaction: void => mixed = reaction(
    () => [
      this.stores.wallets.selected,
      // update if tx history changes
      this.stores.transactions.hash,
    ],
    () => {
      if (this.createVotingRegTx.wasExecuted) {
        this.markStale(true);
      }
    }
  );

  @action.bound
  markStale: boolean => void = status => {
    this.isStale = status;
  };

  setup(): void {
    super.setup();
    const { voting: votingActions } = this.actions.ada;
    this.reset({ justTransaction: false });
    votingActions.generateCatalystKey.listen(this._generateCatalystKey);
    votingActions.createTransaction.listen(this._createTransaction);
    votingActions.signTransaction.listen(this._signTransaction);
    votingActions.complete.listen(this._complete);
    votingActions.reset.listen(this.reset);
  }

  _complete: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
  };

  // we need password for transaction building to sign the voting key with stake key
  // as part of metadata
  @action
  _createTransaction: string => Promise<void> = async spendingPassword => {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) {
      return;
    }

    const withSigning = asGetSigningKey(publicDeriver);
    if (withSigning == null) {
      throw new Error(
        `${nameof(this._createTransaction)} public deriver missing signing functionality.`
      );
    }
    const withStakingKey = asGetAllAccounting(withSigning);
    if (withStakingKey == null) {
      throw new Error(`${nameof(this._createTransaction)} missing staking key functionality`);
    }
    const stakingKey = await genOwnStakingKey({
      publicDeriver: withStakingKey,
      password: spendingPassword,
    });
    const stakeKeyPub = Buffer.from(
      RustModule.WalletV4.StakeCredential.from_keyhash(stakingKey.to_public().hash()).to_bytes()
    ).toString('hex');

    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error(`${nameof(this._createTransaction)} missing utxo functionality`);
    }

    const network = withUtxos.getParent().getNetworkInfo();
    if (isCardanoHaskell(network)) {
      const withHasUtxoChains = asHasUtxoChains(withUtxos);
      if (withHasUtxoChains == null) {
        throw new Error(`${nameof(this._createTransaction)} missing chains functionality`);
      }
      const fullConfig = getCardanoHaskellBaseConfig(
        withHasUtxoChains.getParent().getNetworkInfo()
      );
      const timeToSlot = await genTimeToSlot(fullConfig);
      const absSlotNumber = new BigNumber(
        timeToSlot({
          // use server time for TTL if connected to server
          time: this.stores.serverConnectionStore.serverTime ?? new Date(),
        }).slot
      );

      const catalystPubKey = Buffer.from(this.catalystPrivateKey.to_public().as_bytes())
        .toString('hex');
      const catalystSignature = stakingKey
        .sign(this.catalystPrivateKey.to_public().as_bytes())
        .to_hex();

      const trxMeta = [
        {
          label: '61284',
          data: {
            '1': `0x${catalystPubKey}`,
            '2': `0x${stakeKeyPub}`,
          },
        },
        {
          label: '61285',
          data: { '1': `0x${catalystSignature}` },
        },
      ];

      const votingRegTxPromise = this.createVotingRegTx.execute({
        publicDeriver: withHasUtxoChains,
        absSlotNumber,
        metadata: trxMeta,
      }).promise;
      if (votingRegTxPromise == null) {
        throw new Error(`${nameof(this._createTransaction)} should never happen`);
      }
      await votingRegTxPromise;
      this.markStale(false);
    } else {
      throw new Error(
        `${nameof(VotingStore)}::${nameof(this._createTransaction)} network not supported`
      );
    }
  };

  @action
  _signTransaction: ({|
    password?: string,
    publicDeriver: PublicDeriver<>,
  |}) => Promise<void> = async request => {
    const result = this.createVotingRegTx.result;
    if (result == null) {
      throw new Error(`${nameof(this._signTransaction)} no tx to broadcast`);
    }
    if (isLedgerNanoWallet(request.publicDeriver.getParent())) {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          ledger: {
            signRequest: result,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });
      return;
    }
    if (isTrezorTWallet(request.publicDeriver.getParent())) {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          trezor: {
            signRequest: result,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });
      return;
    }

    // normal password-based wallet
    if (request.password == null) {
      throw new Error(`${nameof(this._signTransaction)} missing password for non-hardware signing`);
    }
    await this.stores.substores.ada.wallets.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          publicDeriver: request.publicDeriver,
          password: request.password,
          signRequest: result,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
    });
  };

  @action _generateCatalystKey: void => Promise<void> = async () => {
    Logger.info(
      `${nameof(VotingStore)}::${nameof(this._generateCatalystKey)} called`
    );
    const passwordArray = [1,2,3,4];
    const passBuff = Buffer.from(passwordArray);
    const rootKey = generatePrivateKeyForCatalyst();
    const key = await encryptWithPassword(passBuff, rootKey.to_raw_key().as_bytes());
    runInAction(() => {
      this.encryptedKey = key;
      this.pin = passwordArray;
      this.catalystPrivateKey = RustModule.WalletV4.PrivateKey.from_extended_bytes(
        rootKey.to_raw_key().as_bytes()
      );
    });
  };

  @action.bound
  reset(request: {| justTransaction: boolean |}): void {
    this.stores.wallets.sendMoneyRequest.reset();
    this.createVotingRegTx.reset();
    if (!request.justTransaction) {
      this.isStale = false;
    }
  }
}
