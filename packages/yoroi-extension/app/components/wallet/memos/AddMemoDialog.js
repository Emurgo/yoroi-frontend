// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import TextField from '../../common/TextField';
import type { TxMemoTablePreInsert } from '../../../api/ada/lib/storage/bridge/memos';
import { isValidMemo } from '../../../utils/validations';
import globalMessages, { memoMessages, } from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import WalletTransaction from '../../../domain/WalletTransaction';
import { MAX_MEMO_SIZE } from '../../../config/externalStorageConfig';
import config from '../../../config';
import styles from './MemoDialogCommon.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  addMemoActionsSubmit: {
    id: 'wallet.transaction.memo.add.dialog.actions.submit',
    defaultMessage: '!!!Add',
  },
});

type Props = {|
  selectedWalletId: number,
  plateTextPart: string,
  selectedTransaction: WalletTransaction,
  error: ?LocalizableError,
  onCancel: void => void,
  onSubmit: TxMemoTablePreInsert => Promise<void>,
  classicTheme: boolean,
|};

type State = {|
  isSubmitting: boolean,
|};

@observer
export default class AddMemoDialog extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isSubmitting: false,
  };

  // $FlowFixMe[value-as-type]
  memoContentInput: TextField;

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      memoContent: {
        label: this.context.intl.formatMessage(memoMessages.memoLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(memoMessages.optionalMemo) : '',
        value: '',
        validators: [({ field }) => (
          [
            isValidMemo(field.value),
            this.context.intl.formatMessage(globalMessages.invalidMemo, { maxMemo: MAX_MEMO_SIZE, })
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
      onSuccess: async (form) => {
        this.setState({ isSubmitting: true });
        const { memoContent } = form.values();
        const memoRequest = {
          publicDeriverId: this.props.selectedWalletId,
          plateTextPart: this.props.plateTextPart,
          memo: {
            Content: memoContent.replace(/ +/g, ' '),
            TransactionHash: this.props.selectedTransaction.txid,
            LastUpdated: new Date()
          },
        };
        await this.props.onSubmit(memoRequest);
      },
      onError: () => {
        this.setState({ isSubmitting: false });
      },
    });
  };

  render(): Node {
    const { intl } = this.context;
    const { form } = this;
    const { memoContent } = form.values();
    const { isSubmitting } = this.state;
    const { error, onCancel, } = this.props;

    const disabledCondition = !(
      isValidMemo(memoContent)
    );

    const actions = [
      {
        className: isSubmitting ? styles.isSubmitting : null,
        label: this.context.intl.formatMessage(messages.addMemoActionsSubmit),
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
        title={intl.formatMessage(memoMessages.addMemo)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onCancel}
      >
        <TextField
          className={styles.memoContent}
          inputRef={(input) => { this.memoContentInput = input; }}
          {...memoContentField.bind()}
          done={memoContentField.isValid}
          error={memoContentField.error}
        />
        { error ? (<ErrorBlock error={error} />) : null }
      </Dialog>);
  }
}
