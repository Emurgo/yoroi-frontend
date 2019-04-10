// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';
import LocalizableError from '../../i18n/LocalizableError';
import type { AdaPaper } from '../../api/ada';
import fileSaver from 'file-saver';

export type ProgressStepEnum = 0 | 1 | 2 | 3;
export const ProgressStep = {
  INIT: 0,
  USER_PASSWORD: 1,
  CREATE: 2,
  VERIFY: 3,
};

export default class PaperWalletCreateStore extends Store {

  @observable progressInfo: ?ProgressStepEnum;
  @observable pdfRenderStatus: ?string;
  @observable pdf: ?Blob;
  error: ?LocalizableError;
  numAddresses: ?number;
  userPassword: ?string;
  paper: ?AdaPaper;

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

  @action _submitInit = async ({ numAddresses }: { numAddresses: number }): Promise<void> => {
    this.numAddresses = numAddresses;
    this.progressInfo = ProgressStep.USER_PASSWORD;
  };

  @action _submitUserPassword = async ({ userPassword }: { userPassword: string }) => {
    this.userPassword = userPassword;
    this.actions.ada.paperWallets.createPaperWallet.trigger({});
    this.actions.ada.paperWallets.createPdfDocument.trigger({});
    this.progressInfo = ProgressStep.CREATE;
  };

  @action _createPaperWallet = async () => {
    if (this.numAddresses && this.userPassword) {
      this.paper = this.api.ada.createAdaPaper({
        numAddresses: this.numAddresses,
        password: this.userPassword
      });
    }
  };

  @action _createPdfDocument = async () => {
    let pdf;
    if (this.paper) {
      pdf = await this.api.ada.createAdaPaperPdf({
        paper: this.paper,
        isMainnet: true, // TODO make dynamic for testnet support,
        logback: (status: string) => {
          this.actions.ada.paperWallets.setPdfRenderStatus.trigger({ status });
          return !!this.paper;
        }
      });
    }
    if (this.paper && pdf) {
      this.actions.ada.paperWallets.setPdf.trigger({ pdf });
    }
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
    this.numAddresses = undefined;
    this.userPassword = undefined;
    this.paper = undefined;
    this.pdf = undefined;
    this.pdfRenderStatus = undefined;
  };
}
