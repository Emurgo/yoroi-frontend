// @flow
import { action, observable, computed, runInAction } from 'mobx';
import { isString } from 'lodash';
import Store from '../base/Store';
import { ADA_REDEMPTION_TYPES } from '../../types/redemptionTypes';
import type { RedemptionTypeChoices } from '../../types/redemptionTypes';
import { Logger } from '../../utils/logging';
import { InvalidMnemonicError } from '../../i18n/errors';
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
import WalletTransaction from '../../domain/WalletTransaction';
import Request from '../lib/LocalizedRequest';
import { getSingleCryptoAccount } from '../../api/ada/adaLocalStorage';

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

  _redeemAda = async ({ walletId, spendingPassword } : {
    walletId: string,
    spendingPassword: string,
  }) => {

    runInAction(() => { this.walletId = walletId; });

    // Since there's no support for multiwallet yet, the only account index present in localStorage
    // is used.
    const accountData = getSingleCryptoAccount();
    const accountIndex = accountData.account;
    if (!accountIndex && accountIndex !== 0) throw new Error('Active account required before redeeming Ada.');

    try {
      const transaction: WalletTransaction = await this.redeemAdaRequest.execute({
        walletId,
        accountIndex,
        spendingPassword,
        redemptionCode: this.redemptionCode
      });
      this._reset();
      this.actions.ada.adaRedemption.adaSuccessfullyRedeemed.trigger({
        walletId,
        // TODO: pass amount once tx has been broadcasted, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
        // amount: transaction.amount.toFormat(DECIMAL_PLACES_IN_ADA),
      });
    } catch (error) {
      runInAction(() => { this.error = error; });
    }
  };

  _redeemPaperVendedAda = async ({ walletId, shieldedRedemptionKey, spendingPassword } : {
    walletId: string,
    shieldedRedemptionKey: string,
    spendingPassword: string,
  }) => {
    runInAction(() => { this.walletId = walletId; });

    const accountData = getSingleCryptoAccount();
    const accountIndex = accountData.account;
    if (!accountIndex && accountIndex !== 0) throw new Error('Active account required before redeeming Ada.');

    try {
      const transaction: WalletTransaction = await this.redeemPaperVendedAdaRequest.execute({
        walletId,
        accountIndex,
        spendingPassword,
        redemptionCode: shieldedRedemptionKey,
        mnemonics: this.passPhrase && this.passPhrase.split(' ')
      });
      this._reset();
      this.actions.ada.adaRedemption.adaSuccessfullyRedeemed.trigger({
        walletId,
        // TODO: pass amount once tx has been broadcasted, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
        // amount: transaction.amount.toFormat(DECIMAL_PLACES_IN_ADA)
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
    // TODO: assign amount once tx has been broadcasted, https://trello.com/c/0FOFzcfy/12-broadcast-redeem-tx
    // this.amountRedeemed = amount;
    this.showAdaRedemptionSuccessMessage = true;
    this.redemptionCode = '';
    this.passPhrase = null;
    this.decryptionKey = null;
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
    this.redemptionCode = '';
    this.passPhrase = null;
    this.email = null;
    this.adaPasscode = null;
    this.adaAmount = null;
    this.decryptionKey = null;
  });

  @action _reset = () => {
    this.error = null;
    this.certificate = null;
    this.isCertificateEncrypted = false;
    this.walletId = null;
    this.redemptionType = ADA_REDEMPTION_TYPES.REGULAR;
    this.redemptionCode = '';
    this.shieldedRedemptionKey = null;
    this.passPhrase = null;
    this.email = null;
    this.adaPasscode = null;
    this.adaAmount = null;
    this.decryptionKey = null;
  };

}
