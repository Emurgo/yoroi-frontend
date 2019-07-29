// @flow
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
  passwordValue: string,
  repeatedPasswordValue: string,
  onNext: Function,
  onCancel: Function,
  onDataChange: Function,
  classicTheme: boolean,
|};

@observer
export default class UserPasswordDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  form = new ReactToolboxMobxForm({
    fields: {
      paperPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(messages.paperPasswordLabel),
        placeholder: this.props.classicTheme ? 
          this.context.intl.formatMessage(messages.paperPasswordPlaceholder) : '',
        value: '',
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
        value: '',
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
        const { paperPassword } = form.values();
        this.props.onNext({ userPassword: paperPassword });
      },
      onError: () => {},
    });
  };

  handleDataChange = (key: string, value: string) => {
    this.props.onDataChange({ [key]: value });
  };

  render() {
    const { form } = this;
    const { paperPassword, repeatPassword } = form.values();
    const { intl } = this.context;
    const {
      onCancel,
      passwordValue,
      repeatedPasswordValue,
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
        classicTheme={classicTheme}
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
            value={passwordValue}
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
            value={repeatedPasswordValue}
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
