// @flow
import { observable, action } from 'mobx';
import WalletSettingsStore from '../base/WalletSettingsStore';
import Request from '../lib/LocalizedRequest';
import type { ChangeModelPasswordFunc, RenameModelFunc } from '../../api/ada';
import {
  PublicDeriver,
  asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';


export default class AdaWalletSettingsStore extends WalletSettingsStore {

  @observable renameModelRequest: Request<RenameModelFunc>
    = new Request<RenameModelFunc>(this.api.ada.renameModel);

  @observable changeSigningKeyRequest: Request<ChangeModelPasswordFunc>
    = new Request<ChangeModelPasswordFunc>(this.api.ada.changeModelPassword);

  setup() {
    const a = this.actions.ada.walletSettings;
    a.startEditingWalletField.listen(this._startEditingWalletField);
    a.stopEditingWalletField.listen(this._stopEditingWalletField);
    a.cancelEditingWalletField.listen(this._cancelEditingWalletField);
    a.renamePublicDeriver.listen(this._renamePublicDeriver);
    a.renameConceptualWallet.listen(this._renameConceptualWallet);
    a.updateSigningPassword.listen(this._changeSigningPassword);
  }

  @action _changeSigningPassword = async (request: {
      publicDeriver: PublicDeriver,
      oldPassword: string,
      newPassword: string
    }
  ): Promise<void> => {
    const withSigningKey = asGetSigningKey(request.publicDeriver);
    if (withSigningKey == null) {
      throw new Error('_changeSigningPassword missing signing functionality');
    }
    await this.changeSigningKeyRequest.execute({ 
      func: withSigningKey.changeSigningKeyPassword,
      request: {
        currentTime: new Date(),
        oldPassword: request.oldPassword,
        newPassword: request.newPassword,
      },
    });
    this.actions.dialogs.closeActiveDialog.trigger();
    this.changeSigningKeyRequest.reset();
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

    publicDeriver.publicDeriverName = request.newName;
  };

  @action _renameConceptualWallet = async (request: {
    newName: string
  }): Promise<void> => {
    // get public deriver
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (!publicDeriver) return;

    const conceptualWallet = publicDeriver.self.getConceptualWallet();
    // update the meta-parameters in the internal wallet representation
    await this.renameModelRequest.execute({
      func: conceptualWallet.rename,
      request: {
        newName: request.newName,
      },
    }).promise;

    publicDeriver.conceptualWalletName = request.newName;
  };

}
