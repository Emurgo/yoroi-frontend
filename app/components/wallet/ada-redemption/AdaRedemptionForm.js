// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import LocalizableError from '../../../i18n/LocalizableError';
import type { RedemptionTypeChoices } from '../../../types/redemptionTypes';

type Props = {
  wallets: Array<{ value: string, label: string }>,
  onAcceptRedemptionDisclaimer: Function,
  onChooseRedemptionType: Function,
  onCertificateSelected: Function,
  onRemoveCertificate: Function,
  onPassPhraseChanged: Function,
  onEmailChanged: Function,
  onAdaPasscodeChanged: Function,
  onAdaAmountChanged: Function,
  onRedemptionCodeChanged: Function,
  onDecryptionKeyChanged: Function,
  onSubmit: Function,
  redemptionType: RedemptionTypeChoices,
  postVendRedemptionCodeValidator: Function,
  redemptionCodeValidator: Function,
  mnemonicValidator: Function,
  getSelectedWallet: Function,
  isRedemptionDisclaimerAccepted: boolean,
  isSubmitting: boolean,
  isCertificateSelected: boolean,
  isCertificateEncrypted: boolean,
  showInputsForDecryptingForceVendedCertificate: boolean,
  showInputForDecryptionKey: boolean,
  showPassPhraseWidget: boolean,
  isCertificateInvalid: boolean,
  redemptionCode: ?string,
  error: ?LocalizableError,
  suggestedMnemonics: Array<string>,
};

@observer
export default class AdaRedemptionForm extends Component<Props> {
  render() {
    return (
      <div>Ada redemption form</div>
    );
  }
}
