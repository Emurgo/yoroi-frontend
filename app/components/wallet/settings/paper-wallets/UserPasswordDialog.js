// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../../themes/skins/InputOwnSkin';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import Dialog from '../../../widgets/Dialog';
import { isValidRepeatPassword, isValidPaperPassword } from '../../../../utils/validations';
import globalMessages from '../../../../i18n/global-messages';
import styles from './UserPasswordDialog.scss';
import headerMixin from '../../../mixins/HeaderBlock.scss';
import config from '../../../../config';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  dialogTitleUserPaperPassword: {
    id: 'settings.paperWallet.dialog.userPassword.title',
    defaultMessage: '!!!Set custom paper wallet password',
  },
  paperPasswordLabel: {
    id: 'settings.paperWallet.dialog.paperPasswordLabel',
    defaultMessage: '!!!Paper wallet password',
  },
  repeatPasswordLabel: {
    id: 'settings.paperWallet.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat paper wallet password',
  },
  paperPasswordPlaceholder: {
    id: 'settings.paperWallet.dialog.paperPasswordPlaceholder',
    defaultMessage: '!!!Type paper wallet password',
  },
  repeatPasswordPlaceholder: {
    id: 'settings.paperWallet.dialog.repeatPasswordPlaceholder',
    defaultMessage: '!!!Type paper wallet password again',
  },
  paperPasswordIntroLine1: {
    id: 'settings.paperWallet.dialog.password.intro.line1',
    defaultMessage: '!!!Yoroi Paper Wallets are encrypted with a password.',
  },
  paperPasswordIntroLine2: {
    id: 'settings.paperWallet.dialog.password.intro.line2',
    defaultMessage: '!!!You <strong>must</strong> have it to restore your funds!',
  },
  paperPasswordIntroLine3: {
    id: 'settings.paperWallet.dialog.password.intro.line3',
    defaultMessage: '!!!It is <strong>your own</strong> responsibility to make sure you remember it.',
  },
});

type Props = {|
  +dialogData: {|
    +passwordValue: string,
    +repeatedPasswordValue: string,
  |},
  +onNext: {| userPassword: string |} => PossiblyAsync<void>,
  +onCancel: void => PossiblyAsync<void>,
  +onDataChange: { [key: string]: any, ... } => void,
  +classicTheme: boolean,
|};

@observer
export default class UserPasswordDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      paperPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.paperPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.paperPasswordPlaceholder) : '',
        value: this.props.dialogData.passwordValue,
        validators: [({ field, form }) => {
          const repeatPasswordField = form.$('repeatPassword');
          if (repeatPasswordField.value.length > 0) {
            repeatPasswordField.validate({ showErrors: true });
          }
          return [
            isValidPaperPassword(field.value),
            this.context.intl.formatMessage(globalMessages.invalidPaperPassword)
          ];
        }],
      },
      repeatPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.repeatPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.repeatPasswordPlaceholder) : '',
        value: this.props.dialogData.repeatedPasswordValue,
        validators: [({ field, form }) => {
          const paperPassword = form.$('paperPassword').value;
          if (paperPassword.length === 0) return [true];
          return [
            isValidRepeatPassword(paperPassword, field.value),
            this.context.intl.formatMessage(globalMessages.invalidRepeatPassword)
          ];
        }],
      },
    }
  }, {
    options: {
      showErrorsOnInit: Object.keys(this.props.dialogData)
        .map(key => this.props.dialogData[key])
        .filter(val => val !== '' && val != null)
        .length > 0,
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  submit: (() => void) = () => {
    this.form.submit({
      onSuccess: async (form) => {
        const { paperPassword } = form.values();
        await this.props.onNext({ userPassword: paperPassword });
      },
      onError: () => {},
    });
  };

  handleDataChange: ((key: string, value: string) => void) = (key, value) => {
    this.props.onDataChange({ [key]: value });
  };

  render(): Node {
    const { form } = this;
    const { paperPassword, repeatPassword } = form.values();
    const { intl } = this.context;
    const {
      onCancel,
      dialogData,
      classicTheme,
    } = this.props;

    const dialogClasses = classnames(['userPasswordDialog', styles.dialog]);
    const confirmButtonClasses = classnames(['confirmButton']);

    const disabledCondition = !(
      isValidPaperPassword(paperPassword)
      && isValidRepeatPassword(paperPassword, repeatPassword)
    );

    const actions = [
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        onClick: this.submit,
        primary: true,
        disabled: disabledCondition,
        className: confirmButtonClasses,
      },
    ];

    const paperPasswordField = form.$('paperPassword');
    const repeatedPasswordField = form.$('repeatPassword');

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleUserPaperPassword)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        <div className={classicTheme ? headerMixin.headerBlockClassic : headerMixin.headerBlock}>
          <span>{intl.formatMessage(messages.paperPasswordIntroLine1)}</span><br />
          <span><FormattedHTMLMessage {...messages.paperPasswordIntroLine2} /></span><br />
          <span><FormattedHTMLMessage {...messages.paperPasswordIntroLine3} /></span><br />
        </div>

        <div className={styles.paperPassword}>
          <Input
            type="password"
            className={styles.paperPassword}
            value={dialogData.passwordValue}
            onChange={(value) => this.handleDataChange('passwordValue', value)}
            {...paperPasswordField.bind()}
            done={isValidPaperPassword(paperPassword)}
            error={paperPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>
        <div className={styles.repeatedPassword}>
          <Input
            type="password"
            className={styles.repeatedPassword}
            value={dialogData.repeatedPasswordValue}
            onChange={(value) => this.handleDataChange('repeatedPasswordValue', value)}
            done={repeatPassword && isValidRepeatPassword(paperPassword, repeatPassword)}
            {...repeatedPasswordField.bind()}
            error={repeatedPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>
      </Dialog>
    );
  }

}
