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
} from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import {
  IPublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import { removeAllTransactions } from '../../api/ada/lib/storage/bridge/updateTransactions';
import {
  Logger,
} from '../../utils/logging';

export default class AdaWalletSettingsStore extends WalletSettingsStore {

  @observable renameModelRequest: Request<RenameModelFunc>
    = new Request<RenameModelFunc>(this.api.ada.renameModel);

  @observable changeSigningKeyRequest: Request<ChangeModelPasswordFunc>
    = new Request<ChangeModelPasswordFunc>(this.api.ada.changeModelPassword);

  @observable clearHistory: Request<typeof _clearHistory>
    = new Request<typeof _clearHistory>(_clearHistory);

  setup(): void {
    const a = this.actions.ada.walletSettings;
    a.startEditingWalletField.listen(this._startEditingWalletField);
    a.stopEditingWalletField.listen(this._stopEditingWalletField);
    a.cancelEditingWalletField.listen(this._cancelEditingWalletField);
    a.renamePublicDeriver.listen(this._renamePublicDeriver);
    a.renameConceptualWallet.listen(this._renameConceptualWallet);
    a.updateSigningPassword.listen(this._changeSigningPassword);
    a.resyncHistory.listen(this._resyncHistory);
  }

  @action _changeSigningPassword = async (request: {
    publicDeriver: PublicDeriverWithCachedMeta,
    oldPassword: string,
    newPassword: string
  }): Promise<void> => {
    const withSigningKey = asGetSigningKey(request.publicDeriver.self);
    if (withSigningKey == null) {
      throw new Error('_changeSigningPassword missing signing functionality');
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
    this.actions.dialogs.closeActiveDialog.trigger();
    this.changeSigningKeyRequest.reset();

    runInAction(() => {
      request.publicDeriver.signingKeyUpdateDate = newUpdateDate;
    });
  };

  @action _renamePublicDeriver = async (request: {
    newName: string
  }): Promise<void> => {
    // get public deriver
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (!publicDeriver) return;

    // update the meta-parameters in the internal wallet representation
    await this.renameModelRequest.execute({
      func: publicDeriver.self.rename,
      request: {
        newName: request.newName,
      },
    }).promise;

    runInAction(() => {
      publicDeriver.publicDeriverName = request.newName;
    });
  };

  @action _renameConceptualWallet = async (request: {
    newName: string
  }): Promise<void> => {
    // get public deriver
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (!publicDeriver) return;

    const conceptualWallet = publicDeriver.self.getParent();
    // update the meta-parameters in the internal wallet representation
    await this.renameModelRequest.execute({
      func: conceptualWallet.rename,
      request: {
        newName: request.newName,
      },
    }).promise;

    runInAction(() => {
      publicDeriver.conceptualWalletName = request.newName;
    });
  };

  @action _resyncHistory = async (request: {|
    publicDeriver: PublicDeriverWithCachedMeta,
  |}): Promise<void> => {
    const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver.self);
    if (withLevels == null) {
      throw new Error(`${nameof(this._resyncHistory)} missing levels`);
    }
    await this.clearHistory.execute({
      publicDeriver: withLevels,
      refreshWallet: () => this.stores.substores.ada.wallets.refreshWallet(request.publicDeriver),
    }).promise;
    this.clearHistory.reset();
  };
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
