// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { join } from 'lodash';
import { isEmail, isEmpty } from 'validator';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectSkin } from 'react-polymorph/lib/skins/simple/SelectSkin';
import { Autocomplete } from 'react-polymorph/lib/components/Autocomplete';
import { AutocompleteSkin } from 'react-polymorph/lib/skins/simple/AutocompleteSkin';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import LocalizableError from '../../../i18n/LocalizableError';
import { InvalidMnemonicError, InvalidEmailError, FieldRequiredError } from '../../../i18n/errors';
import globalMessages from '../../../i18n/global-messages';
import type { RedemptionTypeChoices } from '../../../types/redemptionTypes';
import { ADA_REDEMPTION_TYPES } from '../../../types/redemptionTypes';
import BorderedBox from '../../widgets/BorderedBox';
import AdaRedemptionChoices from './AdaRedemptionChoices';
import AdaRedemptionDisclaimer from './AdaRedemptionDisclaimer';
import AdaCertificateUploadWidget from '../../widgets/forms/AdaCertificateUploadWidget';
import { submitOnEnter } from '../../../utils/form';
import styles from './AdaRedemptionForm.scss';
import { Logger, stringifyError } from '../../../utils/logging';
import config from '../../../config';

const messages = defineMessages({
  headline: {
    id: 'wallet.redeem.dialog.headline',
    defaultMessage: '!!!Ada Redemption',
  },
  instructionsRegular: {
    id: 'wallet.redeem.dialog.instructions.regular',
    defaultMessage: `!!!<p>To redeem your Ada, upload your certificate or copy and paste your redemption code from the certificate.
Below is an example of a redemption key. Your key will look similar:</p>
<p><strong>B_GQOAffMBeRIn6vh1hJmeOT3ViS_TmaT4XAHAfDVH0=</strong></p>
<p>If you upload a PDF file with your certificate, a redemption code will be automatically extracted.</p>
<p>If you upload an <strong>encrypted certificate</strong>, you will need to provide a <strong>{adaRedemptionPassphraseLength} word mnemonic
passphrase</strong> to decrypt your certificate and your redemption code will be automatically extracted.</p>`,
  },
  instructionsForceVended: {
    id: 'wallet.redeem.dialog.instructions.forceVended',
    defaultMessage: `!!!<p>To redeem your Ada, upload your certificate or copy and paste your redemption code from the certificate.
Below is an example of a redemption key. Your key will look similar:</p><p><strong>B_GQOAffMBeRIn6vh1hJmeOT3ViS_TmaT4XAHAfDVH0=</strong></p>
<p>If you upload a PDF file with your certificate, the redemption code will be automatically extracted.</p>
<p>If you upload an <strong>encrypted certificate</strong>, you will need to provide <strong>your email address, Ada passcode and Ada amount</strong>
to decrypt your certificate and your redemption code will be automatically extracted.</p>`,
  },
  instructionsRecoveryRegular: {
    id: 'wallet.redeem.dialog.instructions.recoveryRegular',
    defaultMessage: `!!!<p>To redeem your Ada using the regularly vended certificate from the recovery service, please upload your encrypted certificate and enter a {adaRedemptionPassphraseLength}-word mnemonic passphrase.</p>
  >After you upload your <strong>encrypted certificate</strong> and enter your <strong>{adaRedemptionPassphraseLength}-word mnemonic passphrase</strong>, your redemption key will be automatically extracted and you will be able to redeem your Ada to the selected wallet.</p>`,
  },
  instructionsRecoveryForceVended: {
    id: 'wallet.redeem.dialog.instructions.recoveryForceVended',
    defaultMessage: `!!!<p>To redeem your Ada using the force vended certificate from the recovery service, please upload your encrypted certificate and enter the decryption key. Your decryption key should look like this:</p>
  ><strong>qXQWDxI3JrlFRtC4SeQjeGzLbVXWBomYPbNO1Vfm1T4=</strong></p>
  >After you upload your <strong>encrypted certificate</strong> and enter your <strong>decryption key</strong>, your redemption key will be automatically extracted and you will be able to redeem your Ada to the selected wallet.</p>`,
  },
  instructionsPaperVended: {
    id: 'wallet.redeem.dialog.instructions.paperVended',
    defaultMessage: `!!!<p>To redeem your Ada, enter your shielded vending key from the certificate, choose a wallet
where Ada should be redeemed and enter {adaRedemptionPassphraseLength} word mnemonic passphrase.</p>`,
  },
  certificateLabel: {
    id: 'wallet.redeem.dialog.certificateLabel',
    defaultMessage: '!!!Certificate',
  },
  certificateHint: {
    id: 'wallet.redeem.dialog.certificateHint',
    defaultMessage: '!!!Drop the file with your certificate here or click to find on your computer',
  },
  walletSelectLabel: {
    id: 'wallet.redeem.dialog.walletSelectLabel',
    defaultMessage: '!!!Choose Wallet',
  },
  passphraseLabel: {
    id: 'wallet.redeem.dialog.passphraseLabel',
    defaultMessage: '!!!Passphrase to Decrypt the Ada Voucher Certificate',
  },
  passphraseHint: {
    id: 'wallet.redeem.dialog.passphraseHint',
    defaultMessage: '!!!Enter your {length} word mnemonic here',
  },
  passphraseNoResults: {
    id: 'wallet.redeem.dialog.passphrase.input.noResults',
    defaultMessage: '!!!No results',
  },
  redemptionKeyLabel: {
    id: 'wallet.redeem.dialog.redemptionKeyLabel',
    defaultMessage: '!!!Redemption key',
  },
  shieldedRedemptionKeyLabel: {
    id: 'wallet.redeem.dialog.shieldedRedemptionKeyLabel',
    defaultMessage: '!!!Shielded redemption key',
  },
  decryptionKeyLabel: {
    id: 'wallet.redeem.dialog.decryptionKeyLabel',
    defaultMessage: '!!!Decryption key',
  },
  redemptionKeyError: {
    id: 'wallet.redeem.dialog.redemptionCodeError',
    defaultMessage: '!!!Invalid redemption key',
  },
  shieldedRedemptionKeyError: {
    id: 'wallet.redeem.dialog.shieldedRedemptionCodeError',
    defaultMessage: '!!!Invalid shielded vending key',
  },
  redemptionKeyHint: {
    id: 'wallet.redeem.dialog.redemptionCodeHint',
    defaultMessage: '!!!Enter your redemption key or upload a certificate',
  },
  recoveryRedemptionKeyHint: {
    id: 'wallet.redeem.dialog.recoveryRedemptionKeyHint',
    defaultMessage: '!!!Upload your certificate',
  },
  shieldedRedemptionKeyHint: {
    id: 'wallet.redeem.dialog.shieldedRedemptionKeyHint',
    defaultMessage: '!!!Enter your shielded vending key',
  },
  decryptionKeyHint: {
    id: 'wallet.redeem.dialog.decryptionKeyHint',
    defaultMessage: '!!!Enter your decryption key',
  },
  submitLabel: {
    id: 'wallet.redeem.dialog.submitLabel',
    defaultMessage: '!!!Redeem your money',
  },
  emailLabel: {
    id: 'wallet.redeem.dialog.emailLabel',
    defaultMessage: '!!!Email',
  },
  emailHint: {
    id: 'wallet.redeem.dialog.emailHint',
    defaultMessage: '!!!Enter your email address',
  },
  adaPasscodeLabel: {
    id: 'wallet.redeem.dialog.adaPasscodeLabel',
    defaultMessage: '!!!Ada passcode',
  },
  adaPasscodeHint: {
    id: 'wallet.redeem.dialog.adaPasscodeHint',
    defaultMessage: '!!!Enter your Ada passcode',
  },
  adaAmountLabel: {
    id: 'wallet.redeem.dialog.adaAmountLabel',
    defaultMessage: '!!!Ada amount',
  },
  adaAmountHint: {
    id: 'wallet.redeem.dialog.adaAmountHint',
    defaultMessage: '!!!Enter your Ada amount',
  },
});

type Props = {|
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
  classicTheme: boolean,
|};

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
          length: config.adaRedemption.ADA_REDEMPTION_PASSPHRASE_LENGTH
        }),
        value: [],
        validators: [({ field }) => {
          // Don't validate No pass phrase needed when certificate is not encrypted
          if (!this.props.showPassPhraseWidget) return [true];
          // Otherwise check mnemonic
          const passPhrase = join(field.value, ' ');
          if (!isEmpty(passPhrase)) this.props.onPassPhraseChanged(passPhrase);
          return this.props.mnemonicValidator(passPhrase)
            .then(isValid => (
              [isValid, this.context.intl.formatMessage(new InvalidMnemonicError())]
            ));
        }]
      },
      redemptionKey: {
        label: this.context.intl.formatMessage(messages.redemptionKeyLabel),
        value: '',
        validators: ({ field }) => {
          if (this.props.redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED) return [true];
          const value = this.props.redemptionCode || field.value;
          if (value === '') return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          return this.props.redemptionCodeValidator(value)
            .then(isValid => (
              [isValid, this.context.intl.formatMessage(messages.redemptionKeyError)]
            ));
        },
      },
      shieldedRedemptionKey: {
        label: this.context.intl.formatMessage(messages.shieldedRedemptionKeyLabel),
        placeholder: this.context.intl.formatMessage(messages.shieldedRedemptionKeyHint),
        value: '',
        validators: ({ field }) => {
          if (this.props.redemptionType !== ADA_REDEMPTION_TYPES.PAPER_VENDED) return [true];
          const value = field.value;
          if (value === '') return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          return this.props.postVendRedemptionCodeValidator(value)
            .then(isValid => (
              [isValid, this.context.intl.formatMessage(messages.shieldedRedemptionKeyError)]
            ));
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
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  submit = () => {
    this.form.submit({
      onSuccess: (form) => {
        const { walletId, shieldedRedemptionKey } = form.values();
        this.props.onSubmit({
          walletId,
          shieldedRedemptionKey
        });
      },
      onError: (error) => Logger.error(`adaRedeem::submit ${stringifyError(error)}`),
    });
  };

  resetForm = () => {
    const { form } = this;

    // Cancel all debounced field validations
    form.each((field) => { field.debouncedValidation.cancel(); });

    // We can not user form.reset() call here as it would reset selected walletId
    // which is a bad UX since we are calling resetForm on certificate add/remove
    form.$('adaAmount').reset();
    form.$('adaPasscode').reset();
    form.$('certificate').reset();
    form.$('email').reset();
    form.$('passPhrase').reset();
    form.$('redemptionKey').reset();
    form.$('shieldedRedemptionKey').reset();
    form.$('decryptionKey').reset();

    form.showErrors(false);
  }

  onWalletChange = (walletId: string) => {
    const { form } = this;
    form.$('walletId').value = walletId;
  }

  render() {
    const { intl } = this.context;
    const { form, resetForm, submit } = this;
    const {
      wallets, redemptionType, redemptionCode, onChooseRedemptionType,
      onRedemptionCodeChanged, isCertificateSelected, error, isSubmitting, onCertificateSelected,
      isCertificateEncrypted, isCertificateInvalid, onRemoveCertificate, showPassPhraseWidget,
      suggestedMnemonics, showInputForDecryptionKey, showInputsForDecryptingForceVendedCertificate,
      isRedemptionDisclaimerAccepted, onAcceptRedemptionDisclaimer, classicTheme
    } = this.props;

    const certificateField = form.$('certificate');
    const passPhraseField = form.$('passPhrase');
    const redemptionKeyField = form.$('redemptionKey');
    const shieldedRedemptionKeyField = form.$('shieldedRedemptionKey');
    const walletId = form.$('walletId');
    const emailField = form.$('email');
    const adaPasscodeField = form.$('adaPasscode');
    const adaAmountField = form.$('adaAmount');
    const decryptionKeyField = form.$('decryptionKey');

    const showUploadWidget = redemptionType !== ADA_REDEMPTION_TYPES.PAPER_VENDED;
    const isRecovery = (
      redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_REGULAR ||
      redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED
    );

    let canSubmit = false;
    if ((
      redemptionType === ADA_REDEMPTION_TYPES.REGULAR ||
      redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_REGULAR) &&
      redemptionCode !== ''
    ) canSubmit = true;
    if ((
      redemptionType === ADA_REDEMPTION_TYPES.FORCE_VENDED ||
      redemptionType === ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED) &&
      redemptionCode !== ''
    ) canSubmit = true;
    if (
      redemptionType === ADA_REDEMPTION_TYPES.PAPER_VENDED &&
      shieldedRedemptionKeyField.isDirty &&
      passPhraseField.isDirty
    ) canSubmit = true;

    let instructionMessage = '';
    let instructionValues = {};
    switch (redemptionType) {
      case ADA_REDEMPTION_TYPES.REGULAR:
        instructionMessage = messages.instructionsRegular;
        instructionValues = {
          adaRedemptionPassphraseLength: config.adaRedemption.ADA_REDEMPTION_PASSPHRASE_LENGTH
        };
        break;
      case ADA_REDEMPTION_TYPES.FORCE_VENDED:
        instructionMessage = messages.instructionsForceVended;
        break;
      case ADA_REDEMPTION_TYPES.PAPER_VENDED:
        instructionMessage = messages.instructionsPaperVended;
        instructionValues = {
          adaRedemptionPassphraseLength: config.adaRedemption.ADA_REDEMPTION_PASSPHRASE_LENGTH
        };
        break;
      case ADA_REDEMPTION_TYPES.RECOVERY_REGULAR:
        instructionMessage = messages.instructionsRecoveryRegular;
        instructionValues = {
          adaRedemptionPassphraseLength: config.adaRedemption.ADA_REDEMPTION_PASSPHRASE_LENGTH
        };
        break;
      case ADA_REDEMPTION_TYPES.RECOVERY_FORCE_VENDED:
        instructionMessage = messages.instructionsRecoveryForceVended;
        break;
      default:
        instructionMessage = messages.instructionsRegular;
    }

    const submitButtonClasses = classnames([
      'primary',
      isSubmitting ? styles.submitButtonSpinning : styles.submitButton,
    ]);

    return (
      <div>
        <div className={styles.scrollableContent}>
          <BorderedBox>
            <h1 className={styles.headline}>{intl.formatMessage(messages.headline)}</h1>

            <AdaRedemptionChoices
              activeChoice={redemptionType}
              onSelectChoice={(choice: string) => {
                const isRedemptionTypeChanged = redemptionType !== choice;
                if (isRedemptionTypeChanged) resetForm();
                onChooseRedemptionType(choice);
              }}
              classicTheme={classicTheme}
            />

            <div className={styles.instructions}>
              <FormattedHTMLMessage {...instructionMessage} values={instructionValues} />
            </div>

            <div className={styles.redemption}>
              <div className={styles.inputs}>
                {redemptionType !== ADA_REDEMPTION_TYPES.PAPER_VENDED ? (
                  <Input
                    onKeyPress={submitOnEnter.bind(this, submit)}
                    className="redemption-key"
                    {...redemptionKeyField.bind()}
                    placeholder={
                      intl.formatMessage(messages[
                        isRecovery ? 'recoveryRedemptionKeyHint' : 'redemptionKeyHint'
                      ])
                    }
                    value={redemptionCode}
                    onChange={(value) => {
                      onRedemptionCodeChanged(value);
                      redemptionKeyField.onChange(value);
                    }}
                    disabled={isRecovery || isCertificateSelected}
                    error={redemptionKeyField.error}
                    skin={InputOwnSkin}
                  />
                ) : (
                  <Input
                    onKeyPress={submitOnEnter.bind(this, submit)}
                    className="shielded-redemption-key"
                    {...shieldedRedemptionKeyField.bind()}
                    disabled={isCertificateSelected}
                    error={shieldedRedemptionKeyField.error}
                    skin={InputOwnSkin}
                  />
                )}

                <Select
                  className={styles.walletSelect}
                  options={wallets}
                  {...walletId.bind()}
                  onChange={this.onWalletChange}
                  isOpeningUpward
                  skin={SelectSkin}
                />
              </div>

              {showUploadWidget ? (
                <div className={styles.certificate}>
                  <AdaCertificateUploadWidget
                    {...certificateField.bind()}
                    selectedFile={certificateField.value}
                    onFileSelected={(file) => {
                      resetForm();
                      onCertificateSelected(file);
                      certificateField.set(file);
                    }}
                    isCertificateEncrypted={isCertificateEncrypted}
                    isCertificateSelected={isCertificateSelected}
                    isCertificateInvalid={isCertificateInvalid}
                    onRemoveCertificate={() => {
                      resetForm();
                      onRemoveCertificate();
                    }}
                  />
                </div>
              ) : null}
            </div>

            {showPassPhraseWidget ? (
              <div className={styles.passPhrase}>
                <Autocomplete
                  className="pass-phrase"
                  options={suggestedMnemonics}
                  maxSelections={config.adaRedemption.ADA_REDEMPTION_PASSPHRASE_LENGTH}
                  {...passPhraseField.bind()}
                  error={passPhraseField.error}
                  maxVisibleOptions={5}
                  noResultsMessage={intl.formatMessage(messages.passphraseNoResults)}
                  isOpeningUpward
                  skin={AutocompleteSkin}
                />
              </div>
            ) : null}

            {showInputForDecryptionKey ? (
              <div className={styles.decryptionKey}>
                <Input
                  onKeyPress={submitOnEnter.bind(this, submit)}
                  className="decryption-key"
                  {...decryptionKeyField.bind()}
                  error={decryptionKeyField.error}
                  skin={InputOwnSkin}
                />
              </div>
            ) : null}

            {showInputsForDecryptingForceVendedCertificate ? (
              <div className={styles.email}>
                <Input
                  onKeyPress={submitOnEnter.bind(this, submit)}
                  className="email"
                  {...emailField.bind()}
                  error={emailField.error}
                  skin={InputOwnSkin}
                />
              </div>
            ) : null}

            {showInputsForDecryptingForceVendedCertificate ? (
              <div className={styles.adaPasscode}>
                <Input
                  onKeyPress={submitOnEnter.bind(this, submit)}
                  className="ada-passcode"
                  {...adaPasscodeField.bind()}
                  error={adaPasscodeField.error}
                  skin={InputOwnSkin}
                />
              </div>
            ) : null}

            {showInputsForDecryptingForceVendedCertificate ? (
              <div className={styles.adaAmount}>
                <Input
                  onKeyPress={submitOnEnter.bind(this, submit)}
                  className="ada-amount"
                  {...adaAmountField.bind()}
                  error={adaAmountField.error}
                  skin={InputOwnSkin}
                />
              </div>
            ) : null}

            {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}

            <Button
              className={submitButtonClasses}
              label={intl.formatMessage(messages.submitLabel)}
              onClick={submit}
              disabled={!canSubmit}
              skin={ButtonSkin}
            />
          </BorderedBox>
        </div>

        {!isRedemptionDisclaimerAccepted ? (
          <AdaRedemptionDisclaimer
            onSubmit={onAcceptRedemptionDisclaimer}
            classicTheme={classicTheme}
          />
        ) : null}
      </div>
    );
  }
}
