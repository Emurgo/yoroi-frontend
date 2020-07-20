// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';
import LocalizableError from '../../i18n/LocalizableError';
import type { AdaPaper } from '../../api/ada';
import fileSaver from 'file-saver';
import type { PdfGenStepType } from '../../api/ada/paperWallet/paperWalletPdf';
import environment from '../../environment';

export type ProgressStepEnum = 0 | 1 | 2 | 3 | 4;
export const ProgressStep = {
  /**
   * Initiate the paper-wallet generation process.
   */
  INIT: 0,
  /**
   * Take paper password from user.
   */
  USER_PASSWORD: 1,
  /**
   * Generate/Download the paper and PDF certificate.
   */
  CREATE: 2,
  /**
   * Ask user to verify paper secrets
   */
  VERIFY: 3,
  /**
   * Confirm verification and give use the addresses on-screen
   */
  FINALIZE: 4,
};

export default class PaperWalletCreateStore extends Store {

  @observable progressInfo: ?ProgressStepEnum;
  @observable pdfRenderStatus: ?PdfGenStepType;
  @observable pdf: ?Blob;
  error: ?LocalizableError;
  numAddresses: ?number;
  printAccountPlate: boolean = true;
  userPassword: ?string;
  paper: ?AdaPaper;

  setup(): void {
    super.setup();
    this._reset();
    const a = this.actions.ada.paperWallets;
    a.submitInit.listen(this._submitInit);
    a.submitUserPassword.listen(this._submitUserPassword);
    a.submitCreate.listen(this._submitCreatePaper);
    a.backToCreate.listen(this._backToCreatePaper);
    a.submitVerify.listen(this._submitVerifyPaper);
    a.createPaperWallet.listen(this._createPaperWallet);
    a.createPdfDocument.listen(this._createPdfDocument);
    a.setPdfRenderStatus.listen(this._setPdfRenderStatus);
    a.setPdf.listen(this._setPdf);
    a.downloadPaperWallet.listen(this._downloadPaperWallet);
    a.cancel.listen(this._cancel);
  }

  @action _submitInit: {|
    numAddresses: number,
    printAccountPlate: boolean
  |} => void = (
    request
  ) => {
    this.numAddresses = request.numAddresses;
    this.printAccountPlate = request.printAccountPlate;
    this.progressInfo = ProgressStep.USER_PASSWORD;
  };

  @action _submitUserPassword: {|
    userPassword: string
  |} => Promise<void> = async ({ userPassword }) => {
    if (this.userPassword != null) {
      throw new Error('User password is already initialized');
    }
    this.userPassword = userPassword;
    this.progressInfo = ProgressStep.CREATE;
    this.actions.ada.paperWallets.createPaperWallet.trigger();
    await this.actions.ada.paperWallets.createPdfDocument.trigger();
  };

  @action _backToCreatePaper: void => void = () => {
    this.progressInfo = ProgressStep.CREATE;
  };

  @action _submitCreatePaper: void => void = () => {
    this.progressInfo = ProgressStep.VERIFY;
  };

  @action _submitVerifyPaper: void => void = () => {
    this.progressInfo = ProgressStep.FINALIZE;
  };

  @action _createPaperWallet: void => void = () => {
    if (this.numAddresses != null && this.userPassword != null) {
      this.paper = this.api.ada.createAdaPaper({
        numAddresses: this.numAddresses,
        password: this.userPassword,
      });
    }
  };

  @action _createPdfDocument: void => Promise<void> = async () => {
    let pdf;
    if (this.paper) {
      pdf = await this.api.ada.createAdaPaperPdf({
        paper: this.paper,
        network: environment.NETWORK,
        printAccountPlate: this.printAccountPlate,
        updateStatus: status => {
          this.actions.ada.paperWallets.setPdfRenderStatus.trigger({ status });
          return !!this.paper;
        }
      });
    }
    if (this.paper && pdf) {
      this.actions.ada.paperWallets.setPdf.trigger({ pdf });
    }
  };

  @action _setPdfRenderStatus: {| status: PdfGenStepType |} => void = (
    { status }
  ) => {
    this.pdfRenderStatus = status;
  };

  @action _setPdf: {| pdf: Blob |} => void = (
    { pdf }
  ) => {
    this.pdf = pdf;
  };

  @action _downloadPaperWallet: void => void = () => {
    fileSaver.saveAs(this.pdf, 'Yoroi-Paper-Wallet.pdf');
  };

  @action _cancel: void => void = () => {
    this.teardown();
  };

  teardown(): void {
    this._reset();
    super.teardown();
  }

  @action
  _reset: void => void = () => {
    this.progressInfo = ProgressStep.INIT;
    this.error = undefined;
    this.numAddresses = undefined;
    this.userPassword = undefined;
    this.paper = undefined;
    this.pdf = undefined;
    this.pdfRenderStatus = undefined;
  };
}
