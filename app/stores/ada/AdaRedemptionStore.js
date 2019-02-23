// @flow
import { action, observable, computed, runInAction } from 'mobx';
import Store from '../base/Store';
import { ADA_REDEMPTION_TYPES } from '../../types/redemptionTypes';
import type { RedemptionTypeChoices } from '../../types/redemptionTypes';
import { Logger, stringifyError } from '../../utils/logging';
import {
  AdaRedemptionEncryptedCertificateParseError,
  AdaRedemptionCertificateParseError,
  NoCertificateError
} from '../../api/ada/errors';
import LocalizableError from '../../i18n/LocalizableError';
import { ROUTES } from '../../routes-config';
import { matchRoute } from '../../utils/routing';
import type { RedeemAdaParams, RedeemPaperVendedAdaParams } from '../../api/ada/adaRedemption';
import { DECIMAL_PLACES_IN_ADA } from '../../config/numbersConfig';
import environment from '../../environment';
import BigNumber from 'bignumber.js';
import Request from '../lib/LocalizedRequest';

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
  @observable isRedemptionDisclaimerAccepted = false;
  @observable walletId: ?string = null;
  @observable shieldedRedemptionKey: ?string = null;
  @observable redeemAdaRequest: Request<RedeemAdaParams> = new Request(this.api.ada.redeemAda);
  // eslint-disable-next-line
  @observable redeemPaperVendedAdaRequest: Request<RedeemPaperVendedAdaParams> = new Request(this.api.ada.redeemPaperVendedAda);
  @observable amountRedeemed: number = 0;
  @observable showAdaRedemptionSuccessMessage: boolean = false;

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
    actions.removeCertificate.listen(this._onRemoveCertificate);
    actions.acceptRedemptionDisclaimer.listen(this._onAcceptRedemptionDisclaimer);
    actions.redeemAda.listen(this._redeemAda);
    actions.redeemPaperVendedAda.listen(this._redeemPaperVendedAda);
    actions.adaSuccessfullyRedeemed.listen(this._onAdaSuccessfullyRedeemed);
    actions.closeAdaRedemptionSuccessOverlay.listen(this._onCloseAdaRedemptionSuccessOverlay);
    this.registerReactions([
      this._resetRedemptionFormValuesOnAdaRedemptionPageLoad,
    ]);
  }

  isValidRedemptionKey = (redemptionKey: string) => (
    this.api.ada.isValidRedemptionKey(redemptionKey)
  );

  isValidRedemptionMnemonic = (mnemonic: string) => (
    this.api.ada.isValidRedemptionMnemonic(mnemonic)
  );

  isValidPaperVendRedemptionKey = (mnemonic: string) => (
    this.api.ada.isValidPaperVendRedemptionKey(mnemonic)
  );

  @computed get isAdaRedemptionPage(): boolean {
    return matchRoute(ROUTES.SETTINGS.ADA_REDEMPTION, this.stores.app.currentRoute);
  }

  @action _chooseRedemptionType = (params: {
    redemptionType: RedemptionTypeChoices,
  }) => {
    if (this.redemptionType !== params.redemptionType) {
      this._reset();
      this.redemptionType = params.redemptionType;
    }
  };

  _onAcceptRedemptionDisclaimer = action(() => {
    this.isRedemptionDisclaimerAccepted = true;
  });

  _setCertificate = action(({ certificate }) => {
    this.certificate = certificate;
    this.isCertificateEncrypted = certificate.type !== 'application/pdf';
    if (this.isCertificateEncrypted && (!this.passPhrase || !this.decryptionKey)) {
      this._resetDecryptionFields();
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

  _onParseError = action((error) => {
    Logger.error('Error received from certificate parsing: ' + stringifyError(error));
    if (this.redemptionType === ADA_REDEMPTION_TYPES.REGULAR) {
      if (this.isCertificateEncrypted) {
        this.error = new AdaRedemptionEncryptedCertificateParseError();
      } else {
        this.error = new AdaRedemptionCertificateParseError();
      }
    }
    this._resetDecryptionFields();
  });

  _redeemAda = async ({ walletId } : {
    walletId: string
  }) => {

    runInAction(() => { this.walletId = walletId; });

    try {
      const transactionAmountInLovelace: BigNumber = await this.redeemAdaRequest.execute({
        redemptionCode: this.redemptionCode
      });
      this._reset();
      const transactionAmountInAda = this._getTransactionAmountInAda(transactionAmountInLovelace);
      this.actions.ada.adaRedemption.adaSuccessfullyRedeemed.trigger({
        walletId,
        amount: transactionAmountInAda.toFormat(DECIMAL_PLACES_IN_ADA),
      });
    } catch (error) {
      runInAction(() => { this.error = error; });
    }
  };

  _redeemPaperVendedAda = async ({ walletId, shieldedRedemptionKey } : {
    walletId: string,
    shieldedRedemptionKey: string
  }) => {
    runInAction(() => { this.walletId = walletId; });

    try {
      const transactionAmountInLovelace: BigNumber =
        await this.redeemPaperVendedAdaRequest.execute({
          redemptionCode: shieldedRedemptionKey,
          mnemonics: this.passPhrase && this.passPhrase.split(' ')
        });
      this._reset();
      const transactionAmountInAda = this._getTransactionAmountInAda(transactionAmountInLovelace);
      this.actions.ada.adaRedemption.adaSuccessfullyRedeemed.trigger({
        walletId,
        amount: transactionAmountInAda.toFormat(DECIMAL_PLACES_IN_ADA),
      });
    } catch (error) {
      runInAction(() => { this.error = error; });
    }
  };

  _onAdaSuccessfullyRedeemed = action(({ walletId, amount } : {
    walletId: string,
    amount: number,
  }) => {
    const { wallets } = this.stores.substores[environment.API];

    Logger.debug('ADA successfully redeemed for wallet: ' + walletId);
    wallets.goToWalletRoute(walletId);
    this.amountRedeemed = amount;
    this.showAdaRedemptionSuccessMessage = true;
    this._resetDecryptionFields();
  });

  _onCloseAdaRedemptionSuccessOverlay = action(() => {
    this.showAdaRedemptionSuccessMessage = false;
  });

  _resetRedemptionFormValuesOnAdaRedemptionPageLoad = () => {
    if (this.isAdaRedemptionPage) this._reset();
  };

  _onRemoveCertificate = action(() => {
    this.error = null;
    this.certificate = null;
    this.email = null;
    this.adaPasscode = null;
    this.adaAmount = null;
    this._resetDecryptionFields();
  });

  _resetDecryptionFields = action(() => {
    this.redemptionCode = '';
    this.passPhrase = null;
    this.decryptionKey = null;
  });

  @action _reset = () => {
    this.error = null;
    this.certificate = null;
    this.isCertificateEncrypted = false;
    this.walletId = null;
    this.redemptionType = ADA_REDEMPTION_TYPES.REGULAR;
    this.shieldedRedemptionKey = null;
    this.email = null;
    this.adaPasscode = null;
    this.adaAmount = null;
    this._resetDecryptionFields();
  };

  _getTransactionAmountInAda = (transactionAmountInLovelace: BigNumber): BigNumber => (
    transactionAmountInLovelace.shift(-DECIMAL_PLACES_IN_ADA)
  );

}
