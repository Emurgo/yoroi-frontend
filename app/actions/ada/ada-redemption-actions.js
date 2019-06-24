// @flow
import Action from '../lib/Action';
import type { RedemptionTypeChoices } from '../../types/redemptionTypes';

// ======= ADA REDEMPTION ACTIONS =======

export default class AdaRedemptionActions {
  chooseRedemptionType: Action<{ redemptionType: RedemptionTypeChoices }> = new Action();
  setCertificate: Action<{ certificate: File | Blob }> = new Action();
  removeCertificate: Action<void> = new Action();
  setPassPhrase: Action<{ passPhrase: string }> = new Action();
  setRedemptionCode: Action<{ redemptionCode: string }> = new Action();
  setEmail: Action<{ email: string }> = new Action();
  setAdaPasscode: Action<{ adaPasscode: string }> = new Action();
  setAdaAmount: Action<{ adaAmount: string }> = new Action();
  setDecryptionKey: Action<{ decryptionKey: string }> = new Action();
  redeemAda: Action<{ walletId: string }> = new Action();
  // eslint-disable-next-line max-len
  redeemPaperVendedAda: Action<{ walletId: string, shieldedRedemptionKey: string }> = new Action();
  adaSuccessfullyRedeemed: Action<{ walletId: string, amount: string }> = new Action();
  acceptRedemptionDisclaimer: Action<void> = new Action();
  closeAdaRedemptionSuccessOverlay: Action<void> = new Action();
}
