// @flow
import { observable, action, runInAction } from 'mobx';
import WalletSettingsStore from '../base/WalletSettingsStore';
import Request from '../lib/LocalizedRequest';
import type { ChangeModelPasswordFunc, RenameModelFunc } from '../../api/ada';
import {
  asGetSigningKey,
  asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IHasLevels,
  IConceptualWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import type {
  IPublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { removeAllTransactions } from '../../api/ada/lib/storage/bridge/updateTransactions';
import { removePublicDeriver } from '../../api/ada/lib/storage/bridge/walletBuilder/remove';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  Logger,
} from '../../utils/logging';
import {
  groupForWallet,
} from '../toplevel/WalletStore';

export default class AdaWalletSettingsStore extends WalletSettingsStore {

  @observable renameModelRequest: Request<RenameModelFunc>
    = new Request<RenameModelFunc>(this.api.ada.renameModel);

  @observable changeSigningKeyRequest: Request<ChangeModelPasswordFunc>
    = new Request<ChangeModelPasswordFunc>(this.api.ada.changeModelPassword);

  @observable clearHistory: Request<typeof _clearHistory>
    = new Request<typeof _clearHistory>(_clearHistory);

  @observable removeWalletRequest: Request<typeof _removeWalletFromDb>
    = new Request<typeof _removeWalletFromDb>(_removeWalletFromDb);

  setup(): void {
    super.setup();
    const a = this.actions.ada.walletSettings;
    a.startEditingWalletField.listen(this._startEditingWalletField);
    a.stopEditingWalletField.listen(this._stopEditingWalletField);
    a.cancelEditingWalletField.listen(this._cancelEditingWalletField);
    a.renamePublicDeriver.listen(this._renamePublicDeriver);
    a.renameConceptualWallet.listen(this._renameConceptualWallet);
    a.updateSigningPassword.listen(this._changeSigningPassword);
    a.resyncHistory.listen(this._resyncHistory);
    a.removeWallet.listen(this._removeWallet);
  }

  @action _changeSigningPassword: {|
    publicDeriver: PublicDeriver<>,
    oldPassword: string,
    newPassword: string
  |} => Promise<void> = async (request) => {
    const withSigningKey = asGetSigningKey(request.publicDeriver);
    if (withSigningKey == null) {
      throw new Error(`${nameof(this._changeSigningPassword)} missing signing functionality`);
    }
    const newUpdateDate = new Date(Date.now());
    await this.changeSigningKeyRequest.execute({
      func: withSigningKey.changeSigningKeyPassword,
      request: {
        currentTime: newUpdateDate,
        oldPassword: request.oldPassword,
        newPassword: request.newPassword,
      },
    });
    runInAction(() => {
      this.stores.wallets.getSigningKeyCache(withSigningKey).signingKeyUpdateDate = newUpdateDate;
    });
    this.actions.dialogs.closeActiveDialog.trigger();
    this.changeSigningKeyRequest.reset();
  };

  @action _renamePublicDeriver: {|
    publicDeriver: PublicDeriver<>,
    newName: string
  |} => Promise<void> = async (request) => {
    // update the meta-parameters in the internal wallet representation
    await this.renameModelRequest.execute({
      func: request.publicDeriver.rename,
      request: {
        newName: request.newName,
      },
    }).promise;

    const settingsCache = this.getPublicDeriverSettingsCache(request.publicDeriver);
    runInAction(() => {
      settingsCache.publicDeriverName = request.newName;
    });
  };

  @action _renameConceptualWallet: {|
    publicDeriver: PublicDeriver<>,
    newName: string
  |} => Promise<void> = async (request) => {
    const conceptualWallet = request.publicDeriver.getParent();
    // update the meta-parameters in the internal wallet representation
    await this.renameModelRequest.execute({
      func: conceptualWallet.rename,
      request: {
        newName: request.newName,
      },
    }).promise;

    const parent = request.publicDeriver.getParent();
    const settingsCache = this.getConceptualWalletSettingsCache(parent);
    runInAction(() => {
      settingsCache.conceptualWalletName = request.newName;
    });
  };

  @action _resyncHistory: {|
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    this.clearHistory.reset();
    const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
    if (withLevels == null) {
      throw new Error(`${nameof(this._resyncHistory)} missing levels`);
    }
    await this.clearHistory.execute({
      publicDeriver: withLevels,
      refreshWallet: () => {
        // clear cache
        const txRequests = this.stores.substores.ada.transactions
          .getTxRequests(request.publicDeriver);
        for (const txRequest of Object.keys(txRequests.requests)) {
          txRequests.requests[txRequest].reset();
        }
        // refresh
        return this.stores.wallets.refreshWalletFromRemote(request.publicDeriver);
      }
    }).promise;
  };

  @action _removeWallet: {|
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    this.removeWalletRequest.reset();
    this.actions.wallets.unselectWallet.trigger(); // deselect before deleting

    const group = groupForWallet(
      this.stores.wallets.grouped,
      request.publicDeriver
    );
    if (group == null) {
      throw new Error(`${nameof(this._removeWallet)} wallet doesn't belong to group`);
    }
    await this.removeWalletRequest.execute({
      publicDeriver: request.publicDeriver,
      conceptualWallet: group.publicDerivers.length === 1
        ? group.conceptualWallet
        : undefined
    }).promise;
    // note: it's possible some other function was waiting for a DB lock
    // and so it may fail if it runs now since underlying data was deleted
    // to avoid this causing an issue, we just refresh the page
    // note: redirect logic will handle going to the right page after reloading
    window.location.reload();
  };
}

async function _removeWalletFromDb(request: {|
  publicDeriver: IPublicDeriver<>,
  conceptualWallet: void | IConceptualWallet,
|}): Promise<void> {
  await removePublicDeriver({
    publicDeriver: request.publicDeriver,
    conceptualWallet: request.conceptualWallet,
  });
}

async function _clearHistory(request: {|
  publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
  refreshWallet: () => Promise<void>,
|}): Promise<void> {
  // 1) clear existing history
  await removeAllTransactions({ publicDeriver: request.publicDeriver });

  // 2) trigger a history sync
  try {
    await request.refreshWallet();
  } catch (_e) {
    Logger.warn(`${nameof(_clearHistory)} failed to connect to remote to resync. Data was still cleared locally`);
  }
}
