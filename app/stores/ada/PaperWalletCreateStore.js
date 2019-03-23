// @flow
import { observable, action } from 'mobx';
import _ from 'lodash';
import Request from '../lib/LocalizedRequest';
import type { UpdateWalletPasswordResponse, UpdateWalletResponse } from '../../api/common';
import Store from "../base/Store";
import LocalizableError from "../../i18n/LocalizableError";

export type ProgressStepEnum = 0 | 1 | 2 | 3 | 4;
export const ProgressStep = {
  INIT: 0,
  USER_PASSWORD: 1,
  CREATE: 2,
  MNEMONIC_PASSWORD: 3,
  VERIFY: 4,
};

export default class PaperWalletCreateStore extends Store {

  @observable createPaperWalletRequest: Request<UpdateWalletResponse> =
    new Request(this.api.ada.createAdaPaper);

  @observable progressInfo: ProgressStepEnum;
  error: ?LocalizableError;
  isCustomPassword: boolean;
  numAddresses: number;
  userPassword: string;

  setup() {
    this._reset();
    const a = this.actions.ada.paperWallets;
    a.submitInit.listen(this._submitInit);
    a.submitUserPassword.listen(this._submitUserPassword);
    a.createPaperWallet.listen(this._createPaperWallet);
    a.downloadPaperWallet.listen(this._downloadPaperWallet);
    a.cancel.listen(this._cancel);
  }

  @action _submitInit = async ({ isCustomPassword, numAddresses }: { isCustomPassword: boolean, numAddresses: number }) => {
    this.isCustomPassword = isCustomPassword;
    this.numAddresses = numAddresses;
    this.progressInfo = isCustomPassword ? ProgressStep.USER_PASSWORD : ProgressStep.CREATE;
  };

  @action _submitUserPassword = async ({ userPassword }: { userPassword: string }) => {
    this.userPassword = userPassword;
    this.progressInfo = ProgressStep.CREATE;
  };

  @action _createPaperWallet = async (
    {
      numAddresses,
      password,
    }: {
      numAddresses: number,
      password?: string,
    }
  ): Promise<void> => {
    const paper = await this.createPaperWalletRequest.execute({ numAddresses, password });
    this.createPaperWalletRequest.reset();
  };

  @action _downloadPaperWallet = async () => {

  };

  @action _cancel = async () => {
    this.teardown();
  };

  teardown(): void {
    this._reset();
    super.teardown();
  }

  _reset = () => {
    this.progressInfo = ProgressStep.INIT;
    this.error = undefined;
    this.isCustomPassword = undefined;
    this.numAddresses = undefined;
    this.userPassword = undefined;
  };
}
