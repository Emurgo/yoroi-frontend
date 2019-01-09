// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { join } from 'lodash';
import { isEmail, isEmpty } from 'validator';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import LocalizableError from '../../../i18n/LocalizableError';
import { InvalidMnemonicError, InvalidEmailError, FieldRequiredError } from '../../../i18n/errors';
import globalMessages from '../../../i18n/global-messages';
import type { RedemptionTypeChoices } from '../../../types/redemptionTypes';
import { FORM_VALIDATION_DEBOUNCE_WAIT } from '../../../config/timingConfig';
import { ADA_REDEMPTION_PASSPHRASE_LENGTH } from '../../../config/cryptoConfig';
import { ADA_REDEMPTION_TYPES } from '../../../types/redemptionTypes';

const messages = defineMessages({
  headline: {
    id: 'wallet.redeem.dialog.headline',
    defaultMessage: '!!!Ada Redemption',
    description: 'Headline "Ada redemption" dialog.'
  },
  instructionsRegular: {
    id: 'wallet.redeem.dialog.instructions.regular',
    defaultMessage: `!!!<p>To redeem your Ada, upload your certificate or copy and paste your redemption code from the certificate.
Below is an example of a redemption key. Your key will look similar:</p>
<p><strong>B_GQOAffMBeRIn6vh1hJmeOT3ViS_TmaT4XAHAfDVH0=</strong></p>
<p>If you upload a PDF file with your certificate, a redemption code will be automatically extracted.</p>
<p>If you upload an <strong>encrypted certificate</strong>, you will need to provide a <strong>{adaRedemptionPassphraseLength} word mnemonic
passphrase</strong> to decrypt your certificate and your redemption code will be automatically extracted.</p>`,
    description: 'Detailed instructions for redeeming Ada from the regular vending',
  },
  instructionsForceVended: {
    id: 'wallet.redeem.dialog.instructions.forceVended',
    defaultMessage: `!!!<p>To redeem your Ada, upload your certificate or copy and paste your redemption code from the certificate.
Below is an example of a redemption key. Your key will look similar:</p><p><strong>B_GQOAffMBeRIn6vh1hJmeOT3ViS_TmaT4XAHAfDVH0=</strong></p>
<p>If you upload a PDF file with your certificate, the redemption code will be automatically extracted.</p>
<p>If you upload an <strong>encrypted certificate</strong>, you will need to provide <strong>your email address, Ada passcode and Ada amount</strong>
to decrypt your certificate and your redemption code will be automatically extracted.</p>`,
    description: 'Detailed instructions for redeeming Ada from the force vending',
  },
  instructionsRecoveryRegular: {
    id: 'wallet.redeem.dialog.instructions.recoveryRegular',
    defaultMessage: `!!!<p>To redeem your Ada using the regularly vended certificate from the recovery service, please upload your encrypted certificate and enter a {adaRedemptionPassphraseLength}-word mnemonic passphrase.</p>
  >After you upload your <strong>encrypted certificate</strong> and enter your <strong>{adaRedemptionPassphraseLength}-word mnemonic passphrase</strong>, your redemption key will be automatically extracted and you will be able to redeem your Ada to the selected wallet.</p>`,
    description: 'Detailed instructions for redeeming Ada from the regular vending via Recovery service',
  },
  instructionsRecoveryForceVended: {
    id: 'wallet.redeem.dialog.instructions.recoveryForceVended',
    defaultMessage: `!!!<p>To redeem your Ada using the force vended certificate from the recovery service, please upload your encrypted certificate and enter the decryption key. Your decryption key should look like this:</p>
  ><strong>qXQWDxI3JrlFRtC4SeQjeGzLbVXWBomYPbNO1Vfm1T4=</strong></p>
  >After you upload your <strong>encrypted certificate</strong> and enter your <strong>decryption key</strong>, your redemption key will be automatically extracted and you will be able to redeem your Ada to the selected wallet.</p>`,
    description: 'Detailed instructions for redeeming Ada from the force vending via Recovery service',
  },
  instructionsPaperVended: {
    id: 'wallet.redeem.dialog.instructions.paperVended',
    defaultMessage: `!!!<p>To redeem your Ada, enter your shielded vending key from the certificate, choose a wallet
where Ada should be redeemed and enter {adaRedemptionPassphraseLength} word mnemonic passphrase.</p>`,
    description: 'Detailed instructions for redeeming Ada from the paper vending',
  },
  certificateLabel: {
    id: 'wallet.redeem.dialog.certificateLabel',
    defaultMessage: '!!!Certificate',
    description: 'Label for the certificate file upload'
  },
  certificateHint: {
    id: 'wallet.redeem.dialog.certificateHint',
    defaultMessage: '!!!Drop the file with your certificate here or click to find on your computer',
    description: 'Hint for the certificate file upload'
  },
  walletSelectLabel: {
    id: 'wallet.redeem.dialog.walletSelectLabel',
    defaultMessage: '!!!Choose Wallet',
    description: 'Label for the wallet select field on Ada redemption form'
  },
  passphraseLabel: {
    id: 'wallet.redeem.dialog.passphraseLabel',
    defaultMessage: '!!!Passphrase to Decrypt the Ada Voucher Certificate',
    description: 'Label for the passphrase to decrypt Ada voucher certificate input'
  },
  passphraseHint: {
    id: 'wallet.redeem.dialog.passphraseHint',
    defaultMessage: '!!!Enter your {length} word mnemonic here',
    description: 'Hint for the mnemonic passphrase input'
  },
  passphraseNoResults: {
    id: 'wallet.redeem.dialog.passphrase.input.noResults',
    defaultMessage: '!!!No results',
    description: '"No results" message for the passphrase input search results.'
  },
  redemptionKeyLabel: {
    id: 'wallet.redeem.dialog.redemptionKeyLabel',
    defaultMessage: '!!!Redemption key',
    description: 'Label for ada redemption key input',
  },
  shieldedRedemptionKeyLabel: {
    id: 'wallet.redeem.dialog.shieldedRedemptionKeyLabel',
    defaultMessage: '!!!Shielded redemption key',
    description: 'Label for shielded redemption key input',
  },
  decryptionKeyLabel: {
    id: 'wallet.redeem.dialog.decryptionKeyLabel',
    defaultMessage: '!!!Decryption key',
    description: 'Label for decryption key input',
  },
  redemptionKeyError: {
    id: 'wallet.redeem.dialog.redemptionCodeError',
    defaultMessage: '!!!Invalid redemption key',
    description: 'Error "Invalid redemption key" for ada redemption code input',
  },
  shieldedRedemptionKeyError: {
    id: 'wallet.redeem.dialog.shieldedRedemptionCodeError',
    defaultMessage: '!!!Invalid shielded vending key',
    description: 'Error "Invalid shielded vending key" for ada redemption code input',
  },
  redemptionKeyHint: {
    id: 'wallet.redeem.dialog.redemptionCodeHint',
    defaultMessage: '!!!Enter your redemption key or upload a certificate',
    description: 'Hint for ada redemption key input',
  },
  recoveryRedemptionKeyHint: {
    id: 'wallet.redeem.dialog.recoveryRedemptionKeyHint',
    defaultMessage: '!!!Upload your certificate',
    description: 'Hint for ada redemption key input shown on Recovery tabs',
  },
  shieldedRedemptionKeyHint: {
    id: 'wallet.redeem.dialog.shieldedRedemptionKeyHint',
    defaultMessage: '!!!Enter your shielded vending key',
    description: 'Hint for shielded vending key input',
  },
  decryptionKeyHint: {
    id: 'wallet.redeem.dialog.decryptionKeyHint',
    defaultMessage: '!!!Enter your decryption key',
    description: 'Hint for decryption key input',
  },
  submitLabel: {
    id: 'wallet.redeem.dialog.submitLabel',
    defaultMessage: '!!!Redeem your money',
    description: 'Label for the "Ada redemption" dialog submit button.'
  },
  emailLabel: {
    id: 'wallet.redeem.dialog.emailLabel',
    defaultMessage: '!!!Email',
    description: 'Label for the email input field.'
  },
  emailHint: {
    id: 'wallet.redeem.dialog.emailHint',
    defaultMessage: '!!!Enter your email address',
    description: 'Hint for the email input field.'
  },
  adaPasscodeLabel: {
    id: 'wallet.redeem.dialog.adaPasscodeLabel',
    defaultMessage: '!!!Ada passcode',
    description: 'Label for the ada passcode input field.'
  },
  adaPasscodeHint: {
    id: 'wallet.redeem.dialog.adaPasscodeHint',
    defaultMessage: '!!!Enter your Ada passcode',
    description: 'Hint for the Ada passcode input field.'
  },
  adaAmountLabel: {
    id: 'wallet.redeem.dialog.adaAmountLabel',
    defaultMessage: '!!!Ada amount',
    description: 'Label for the ada amount input field.'
  },
  adaAmountHint: {
    id: 'wallet.redeem.dialog.adaAmountHint',
    defaultMessage: '!!!Enter your Ada amount',
    description: 'Hint for the Ada amount input field.'
  },
  spendingPasswordPlaceholder: {
    id: 'wallet.redeem.dialog.spendingPasswordPlaceholder',
    defaultMessage: '!!!Password',
    description: 'Placeholder for "spending password"',
  },
  spendingPasswordLabel: {
    id: 'wallet.redeem.dialog.spendingPasswordLabel',
    defaultMessage: '!!!Password',
    description: 'Label for "spending password"',
  },
});

messages.fieldIsRequired = globalMessages.fieldIsRequired;

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

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  form = new ReactToolboxMobxForm({
    fields: {
      certificate: {
        label: this.context.intl.formatMessage(messages.certificateLabel),
        placeholder: this.context.intl.formatMessage(messages.certificateHint),
        type: 'file',
      },
      passPhrase: {
        label: this.context.intl.formatMessage(messages.passphraseLabel),
        placeholder: this.context.intl.formatMessage(messages.passphraseHint, {
          length: ADA_REDEMPTION_PASSPHRASE_LENGTH
        }),
        value: [],
        validators: [({ field }) => {
          // Don't validate No pass phrase needed when certificate is not encrypted
          if (!this.props.showPassPhraseWidget) return [true];
          // Otherwise check mnemonic
          const passPhrase = join(field.value, ' ');
          if (!isEmpty(passPhrase)) this.props.onPassPhraseChanged(passPhrase);
          return [
            this.props.mnemonicValidator(passPhrase),
            this.context.intl.formatMessage(new InvalidMnemonicError())
          ];
        }]
      },
      redemptionKey: {
        label: this.context.intl.formatMessage(messages.redemptionKeyLabel),
        value: '',
        validators: ({ field }) => {
          if (this.props.redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED) return [true];
          const value = this.props.redemptionCode || field.value;
          if (value === '') return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          return [
            this.props.redemptionCodeValidator(value),
            this.context.intl.formatMessage(messages.redemptionKeyError)
          ];
        },
      },
      shieldedRedemptionKey: {
        label: this.context.intl.formatMessage(messages.shieldedRedemptionKeyLabel),
        placeholder: this.context.intl.formatMessage(messages.shieldedRedemptionKeyHint),
        value: '',
        validators: ({ field }) => {
          if (this.props.redemptionType !== ADA_REDEMPTION_TYPES.PAPER_VENDED) return [true];
          const value = field.value;
          if (value === '') return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          return [
            this.props.postVendRedemptionCodeValidator(value),
            this.context.intl.formatMessage(messages.shieldedRedemptionKeyError)
          ];
        },
      },
      walletId: {
        label: this.context.intl.formatMessage(messages.walletSelectLabel),
        value: this.props.wallets[0].value,
      },
      email: {
        label: this.context.intl.formatMessage(messages.emailLabel),
        placeholder: this.context.intl.formatMessage(messages.emailHint),
        value: '',
        validators: [({ field }) => {
          if (!this.props.showInputsForDecryptingForceVendedCertificate) return [true];
          const email = field.value;
          if (isEmail(email)) this.props.onEmailChanged(email);
          return [
            isEmail(email),
            this.context.intl.formatMessage(new InvalidEmailError())
          ];
        }]
      },
      adaPasscode: {
        label: this.context.intl.formatMessage(messages.adaPasscodeLabel),
        placeholder: this.context.intl.formatMessage(messages.adaPasscodeHint),
        value: '',
        validators: [({ field }) => {
          if (!this.props.showInputsForDecryptingForceVendedCertificate) return [true];
          const adaPasscode = field.value;
          if (!isEmpty(adaPasscode)) this.props.onAdaPasscodeChanged(adaPasscode);
          return [
            !isEmpty(adaPasscode),
            this.context.intl.formatMessage(new FieldRequiredError())
          ];
        }],
      },
      adaAmount: {
        label: this.context.intl.formatMessage(messages.adaAmountLabel),
        placeholder: this.context.intl.formatMessage(messages.adaAmountHint),
        value: '',
        validators: [({ field }) => {
          if (!this.props.showInputsForDecryptingForceVendedCertificate) return [true];
          const adaAmount = field.value;
          if (!isEmpty(adaAmount)) this.props.onAdaAmountChanged(adaAmount);
          return [
            !isEmpty(adaAmount),
            this.context.intl.formatMessage(new FieldRequiredError())
          ];
        }],
      },
      spendingPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.spendingPasswordLabel),
        placeholder: this.context.intl.formatMessage(messages.spendingPasswordPlaceholder),
        value: '',
        validators: [({ field, form }) => {
          const password = field.value;
          const walletId = form.$('walletId').value;
          const wallet = this.props.getSelectedWallet(walletId);
          if (wallet && wallet.hasPassword && password === '') {
            return [false, this.context.intl.formatMessage(messages.fieldIsRequired)];
          }
          return [true];
        }],
      },
      decryptionKey: {
        label: this.context.intl.formatMessage(messages.decryptionKeyLabel),
        placeholder: this.context.intl.formatMessage(messages.decryptionKeyHint),
        value: '',
        validators: ({ field }) => {
          if (!this.props.showInputForDecryptionKey) return [true];
          const decryptionKey = field.value;
          if (!isEmpty(decryptionKey)) this.props.onDecryptionKeyChanged(decryptionKey);
          return [
            !isEmpty(decryptionKey),
            this.context.intl.formatMessage(new FieldRequiredError())
          ];
        },
      },
    }
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: FORM_VALIDATION_DEBOUNCE_WAIT,
    },
  });

  render() {
    return (
      <div>Ada redemption form</div>
    );
  }
}
