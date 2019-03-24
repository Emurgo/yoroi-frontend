// @flow
import { observable, action } from 'mobx';
import _ from 'lodash';
import Request from '../lib/LocalizedRequest';
import type { UpdateWalletPasswordResponse, UpdateWalletResponse } from '../../api/common';
import Store from "../base/Store";
import LocalizableError from "../../i18n/LocalizableError";
import type { AdaPaper } from "../../api/ada";
import fileSaver from 'file-saver';

export type ProgressStepEnum = 0 | 1 | 2 | 3 | 4;
export const ProgressStep = {
  INIT: 0,
  USER_PASSWORD: 1,
  CREATE: 2,
  MNEMONIC_PASSWORD: 3,
  VERIFY: 4,
};

export default class PaperWalletCreateStore extends Store {

  @observable progressInfo: ProgressStepEnum;
  @observable pdfRenderStatus: string;
  @observable pdf: Blob;
  error: ?LocalizableError;
  isCustomPassword: boolean;
  numAddresses: number;
  userPassword: string;
  paper: AdaPaper;

  setup() {
    this._reset();
    const a = this.actions.ada.paperWallets;
    a.submitInit.listen(this._submitInit);
    a.submitUserPassword.listen(this._submitUserPassword);
    a.createPaperWallet.listen(this._createPaperWallet);
    a.createPdfDocument.listen(this._createPdfDocument);
    a.setPdfRenderStatus.listen(this._setPdfRenderStatus);
    a.setPdf.listen(this._setPdf);
    a.downloadPaperWallet.listen(this._downloadPaperWallet);
    a.cancel.listen(this._cancel);
  }

  @action _submitInit = async ({ isCustomPassword, numAddresses }: { isCustomPassword: boolean, numAddresses: number }): Promise<void> => {
    this.isCustomPassword = isCustomPassword;
    this.numAddresses = numAddresses;
    if (isCustomPassword) {
      this.progressInfo = ProgressStep.USER_PASSWORD;
    } else {
      this.actions.ada.paperWallets.createPaperWallet.trigger();
      this.actions.ada.paperWallets.createPdfDocument.trigger();
      this.progressInfo = ProgressStep.CREATE;
    }
  };

  @action _submitUserPassword = async ({ userPassword }: { userPassword: string }) => {
    this.userPassword = userPassword;
    this.actions.ada.paperWallets.createPaperWallet.trigger();
    this.actions.ada.paperWallets.createPdfDocument.trigger();
    this.progressInfo = ProgressStep.CREATE;
  };

  @action _createPaperWallet = async (): Promise<AdaPaper> => {
    this.paper = this.api.ada.createAdaPaper({
      numAddresses: this.numAddresses,
      password: this.userPassword
    });
  };

  @action _createPdfDocument = async (): Promise<AdaPaper> => {
    const pdf = await this.api.ada.createAdaPaperPdf({
      paper: this.paper,
      isMainnet: true, // TODO make dynamic for testnet support,
      logback: (status: string) => {
        this.actions.ada.paperWallets.setPdfRenderStatus.trigger({ status })
      }
    });
    this.actions.ada.paperWallets.setPdf.trigger({ pdf });
  };

  @action _setPdfRenderStatus = async ({ status }: { status: string }) => {
    this.pdfRenderStatus = status;
  };

  @action _setPdf = async ({ pdf }: { pdf: Blob }) => {
    this.pdf = pdf;
  };

  @action _downloadPaperWallet = async () => {
    fileSaver.saveAs(this.pdf, 'Yoroi-Paper-Wallet.pdf');
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
    this.paper = undefined;
    this.pdf = undefined;
    this.pdfRenderStatus = undefined;
  };
}
