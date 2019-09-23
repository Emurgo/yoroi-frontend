// @flow

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { isValidMemo } from '../../../utils/validations';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import WalletTransaction from '../../../domain/WalletTransaction';
import config from '../../../config';
import styles from './MemoDialogCommon.scss';

const messages = defineMessages({
  editMemoTitle: {
    id: 'wallet.transaction.memo.edit.dialog.title',
    defaultMessage: '!!!Edit memo',
  },
  editMemoInputLabel: {
    id: 'wallet.transaction.memo.edit.dialog.input.label',
    defaultMessage: '!!!Memo',
  },
  editMemoActionsSubmit: {
    id: 'wallet.transaction.memo.edit.dialog.actions.submit',
    defaultMessage: '!!!Save',
  },
});

type Props = {|
  selectedTransaction: WalletTransaction,
  error: ?LocalizableError,
  onCancel: Function,
  onSubmit: Function,
  onClickDelete: Function,
  classicTheme: boolean,
|};

type State = {
  isSubmitting: boolean,
};

@observer
export default class EditMemoDialog extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    isSubmitting: false,
  };

  memoContentInput: Input;

  form = new ReactToolboxMobxForm({
    fields: {
      memoContent: {
        type: 'memo',
        label: this.context.intl.formatMessage(messages.editMemoInputLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.editMemoInputLabel) : '',
        value: this.props.selectedTransaction.memo,
        validators: [({ field }) => (
          [
            isValidMemo(field.value),
            this.context.intl.formatMessage(globalMessages.invalidMemo)
          ]
        )],
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
        this.setState({ isSubmitting: true });
        const { memoContent } = form.values();
        const memoData = {
          memo: memoContent,
          tx: this.props.selectedTransaction.id,
          lastUpdated: new Date()
        };
        this.props.onSubmit(memoData);
      },
      onError: () => {
        this.setState({ isSubmitting: false });
      },
    });
  };

  render() {
    const { intl } = this.context;
    const { form } = this;
    const { memoContent } = form.values();
    const { isSubmitting } = this.state;
    const {
      error,
      onCancel,
      onClickDelete,
      classicTheme
    } = this.props;

    const disabledCondition = !(
      isValidMemo(memoContent)
    );

    const actions = [
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: this.context.intl.formatMessage(messages.editMemoActionsSubmit),
        primary: true,
        onClick: this.submit,
        disabled: isSubmitting || disabledCondition
      },
    ];

    const memoContentField = form.$('memoContent');

    return (
      <Dialog
        className={classnames([styles.component])}
        title={intl.formatMessage(messages.editMemoTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onCancel}
        classicTheme={classicTheme}
      >
        <Input
          className={styles.memoContent}
          inputRef={(input) => { this.memoContentInput = input; }}
          {...memoContentField.bind()}
          error={memoContentField.error}
          onDelete={onClickDelete}
          skin={InputOwnSkin}
        />
        { error ? (<ErrorBlock error={error} />) : null }
      </Dialog>);
  }
}
