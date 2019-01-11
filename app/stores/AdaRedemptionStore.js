// @flow
import { action, observable } from 'mobx';
import { isString } from 'lodash';
import Store from './lib/Store';
import { ADA_REDEMPTION_TYPES } from '../types/redemptionTypes';
import type { RedemptionTypeChoices } from '../types/redemptionTypes';
import { Logger } from '../utils/logging';
import { InvalidMnemonicError } from '../i18n/errors';
import { AdaRedemptionEncryptedCertificateParseError, AdaRedemptionCertificateParseError, NoCertificateError } from '../api/ada/errors';
import LocalizableError from '../i18n/LocalizableError';

export default class AdaRedemptionStore extends Store {

  @observable redemptionType: RedemptionTypeChoices = ADA_REDEMPTION_TYPES.REGULAR;
  @observable redemptionCode: string = '';
  @observable certificate: ?Blob = null;
  @observable decryptionKey: ?string = null;
  @observable error: ?LocalizableError = null;
  @observable isCertificateEncrypted = false;
  @observable passPhrase: ?string = null;
  @observable email: ?string = null;
  @observable adaAmount: ?string = null;
  @observable adaPasscode: ?string = null;

  setup() {
    const actions = this.actions.ada.adaRedemption;
    actions.chooseRedemptionType.listen(this._chooseRedemptionType);
    actions.setCertificate.listen(this._setCertificate);
    actions.setPassPhrase.listen(this._setPassPhrase);
    actions.setRedemptionCode.listen(this._setRedemptionCode);
    actions.setEmail.listen(this._setEmail);
    actions.setAdaPasscode.listen(this._setAdaPasscode);
    actions.setAdaAmount.listen(this._setAdaAmount);
    actions.setDecryptionKey.listen(this._setDecryptionKey);
  }

  isValidRedemptionMnemonic = (passPhrase: string) => (
    // TODO: implement method
    true
  );

  @action _chooseRedemptionType = (params: {
    redemptionType: RedemptionTypeChoices,
  }) => {
    if (this.redemptionType !== params.redemptionType) {
      this._reset();
      this.redemptionType = params.redemptionType;
    }
  };

  _setCertificate = action(({ certificate }) => {
    this.certificate = certificate;
    this.isCertificateEncrypted = certificate.type !== 'application/pdf';
    if (this.isCertificateEncrypted && (!this.passPhrase || !this.decryptionKey)) {
      this.redemptionCode = '';
      this.passPhrase = null;
      this.decryptionKey = null;
      return; // We cannot decrypt it yet!
    }
    this._parseCodeFromCertificate();
  });

  _setPassPhrase = action(({ passPhrase } : { passPhrase: string }) => {
    this.passPhrase = passPhrase;
    if (this.isValidRedemptionMnemonic(passPhrase)) this._parseCodeFromCertificate();
  });

  _setRedemptionCode = action(({ redemptionCode } : { redemptionCode: string }) => {
    this.redemptionCode = redemptionCode;
  });

  _setEmail = action(({ email } : { email: string }) => {
    this.email = email;
    this._parseCodeFromCertificate();
  });

  _setAdaPasscode = action(({ adaPasscode } : { adaPasscode: string }) => {
    this.adaPasscode = adaPasscode;
    this._parseCodeFromCertificate();
  });

  _setAdaAmount = action(({ adaAmount } : { adaAmount: string }) => {
    this.adaAmount = adaAmount;
    this._parseCodeFromCertificate();
  });

  _setDecryptionKey = action(({ decryptionKey } : { decryptionKey: string }) => {
    this.decryptionKey = decryptionKey;
    this._parseCodeFromCertificate();
  });

  _parseCodeFromCertificate() {
    if (
      this.redemptionType === ADA_REDEMPTION_TYPES.REGULAR ||
      this.redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_REGULAR
    ) {
      if (!this.passPhrase && this.isCertificateEncrypted) return;
    }
    if (this.redemptionType === ADA_REDEMPTION_TYPES.FORCE_VENDED) {
      if ((!this.email || !this.adaAmount || !this.adaPasscode) && this.isCertificateEncrypted) {
        return;
      }
    }
    if (this.redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED) {
      if (!this.decryptionKey && this.isCertificateEncrypted) return;
    }
    if (this.redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED) return;
    if (this.certificate === null) throw new NoCertificateError();
    let decryptionKey = null;
    if ((
      this.redemptionType === ADA_REDEMPTION_TYPES.REGULAR ||
      this.redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_REGULAR) &&
      this.isCertificateEncrypted
    ) {
      decryptionKey = this.passPhrase;
    }
    if (
      this.redemptionType === ADA_REDEMPTION_TYPES.FORCE_VENDED &&
      this.isCertificateEncrypted
    ) {
      decryptionKey = [this.email, this.adaPasscode, this.adaAmount].toString();
    }
    if (
      this.redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED &&
      this.isCertificateEncrypted
    ) {
      decryptionKey = this.decryptionKey;
    }
    this.api.ada.getPDFSecretKey(this.certificate, decryptionKey, this.redemptionType)
      .then(code => this._onCodeParsed(code))
      .catch(error => this._onParseError(error));
  }

  _onCodeParsed = action(code => {
    Logger.debug('Redemption code parsed from certificate: ' + code);
    this.redemptionCode = code;
  });

  _onParseError = action(error => {
    const errorMessage = isString(error) ? error : error.message;
    if (errorMessage.includes('Invalid mnemonic')) {
      this.error = new InvalidMnemonicError();
    } else if (this.redemptionType === ADA_REDEMPTION_TYPES.REGULAR) {
      if (this.isCertificateEncrypted) {
        this.error = new AdaRedemptionEncryptedCertificateParseError();
      } else {
        this.error = new AdaRedemptionCertificateParseError();
      }
    }
    this.redemptionCode = '';
    this.passPhrase = null;
    this.decryptionKey = null;
  });

  @action _reset = () => {
    this.redemptionType = ADA_REDEMPTION_TYPES.REGULAR;
    this.redemptionCode = '';
  };

}
