// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import ErrorBlock from '../../widgets/ErrorBlock';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import TextField from '../../common/TextField';
import type { TxMemoTableUpsert } from '../../../api/ada/lib/storage/bridge/memos';
import { isValidMemo } from '../../../utils/validations';
import globalMessages, { memoMessages, } from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
import { MAX_MEMO_SIZE } from '../../../config/externalStorageConfig';
import config from '../../../config';
import styles from './MemoDialogCommon.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { IconButton, InputAdornment } from '@mui/material';
import { ReactComponent as CloseIcon }  from '../../../assets/images/forms/close.inline.svg'

type Props = {|
  selectedWalletId: number,
  plateTextPart: string,
  existingMemo: $ReadOnly<TxMemoTableRow>,
  error: ?LocalizableError,
  onCancel: void => void,
  onSubmit: TxMemoTableUpsert => Promise<void>,
  onClickDelete: void => void,
  classicTheme: boolean,
|};

type State = {|
  isSubmitting: boolean,
|};

@observer
export default class EditMemoDialog extends Component<Props, State> {

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
        type: 'memo',
        label: this.context.intl.formatMessage(memoMessages.memoLabel),
        placeholder: this.props.classicTheme
          ? this.context.intl.formatMessage(memoMessages.memoLabel)
          : '',
        value: this.props.existingMemo.Content,
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
            TransactionHash: this.props.existingMemo.TransactionHash,
            LastUpdated: new Date(),
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
        label: this.context.intl.formatMessage(globalMessages.save),
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
        title={intl.formatMessage(memoMessages.editMemo)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onCancel}
      >
        <TextField
          className={styles.memoContent}
          inputRef={(input) => { this.memoContentInput = input; }}
          {...memoContentField.bind()}
          error={memoContentField.error}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="delete memo" onClick={onClickDelete}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        { error ? (<ErrorBlock error={error} />) : null }
      </Dialog>);
  }
}
