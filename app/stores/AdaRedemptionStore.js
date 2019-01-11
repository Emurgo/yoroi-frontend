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
    actions.setRedemptionCode.listen(this._setRedemptionCode);
  }

  @action _chooseRedemptionType = (params: {
    redemptionType: RedemptionTypeChoices,
  }) => {
    if (this.redemptionType !== params.redemptionType) {
      this._reset();
      this.redemptionType = params.redemptionType;
    }
  };

  _setRedemptionCode = action(({ redemptionCode }: { redemptionCode: string }) => {
    this.redemptionCode = redemptionCode;
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
