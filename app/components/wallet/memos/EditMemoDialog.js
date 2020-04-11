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
import type { TxMemoTablePreInsert } from '../../../api/ada/lib/storage/bridge/memos';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { isValidMemo } from '../../../utils/validations';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
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
  selectedWallet: PublicDeriver<>,
  existingMemo: $ReadOnly<TxMemoTableRow>,
  error: ?LocalizableError,
  onCancel: void => void,
  onSubmit: TxMemoTablePreInsert => Promise<void>,
  onClickDelete: void => void,
  classicTheme: boolean,
|};

type State = {|
  isSubmitting: boolean,
|};

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
        placeholder: this.props.classicTheme
          ? this.context.intl.formatMessage(messages.editMemoInputLabel)
          : '',
        value: this.props.existingMemo,
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

  submit: void => void = () => {
    this.form.submit({
      onSuccess: (form) => {
        this.setState({ isSubmitting: true });
        const { memoContent } = form.values();
        const memoRequest = {
          publicDeriver: this.props.selectedWallet,
          memo: {
            Content: memoContent.replace(/ +/g, ' '),
            TransactionHash: this.props.existingMemo.TransactionHash,
            LastUpdated: new Date(),
          },
        };
        this.props.onSubmit(memoRequest);
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
        isSubmitting,
        disabled: disabledCondition
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
