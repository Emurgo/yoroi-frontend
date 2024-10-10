// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Button, Box } from '@mui/material';
import TextField from '../../common/TextField';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import BorderedBox from '../../widgets/BorderedBox';
import styles from './DelegationSendForm.scss';
import globalMessages from '../../../i18n/global-messages';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import LocalizableError from '../../../i18n/LocalizableError';
import { bech32 } from 'bech32';
import { isHex } from '@emurgo/yoroi-lib/dist/internals/utils/index';
import { bytesToHex } from '../../../coreUtils';

const messages = defineMessages({
  invalidPoolId: {
    id: 'wallet.delegate.form.invalidPoolId',
    defaultMessage: '!!!Invalid pool ID. Please retype.',
  },
});

type Props = {|
  +hasAnyPending: boolean,
  +updatePool: (void | string) => void,
  +poolQueryError: ?LocalizableError,
  +onNext: void => Promise<void>,
  +isProcessing: boolean,
|};

function validateAndSetPool(poolId: string, updatePool: (void | string) => void): boolean {
  const validateHex: string => boolean = id => {
    if (id.length !== 56) {
      return false;
    }
    return isHex(id);
  };
  try {
    const payload = bytesToHex(bech32.fromWords(bech32.decode(poolId, 1000).words));
    if (validateHex(payload)) {
      updatePool(payload);
      return true;
    }
  } catch (_e) {
    if (validateHex(poolId)) {
      updatePool(poolId);
      return true;
    }
  }
  updatePool(undefined);
  return false;
}

@observer
export default class DelegationSendForm extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        poolId: {
          label: this.context.intl.formatMessage(globalMessages.stakePoolHash),
          placeholder: '',
          value: '',
          validators: [
            ({ field }) => {
              const poolIdValue = field.value;
              if (poolIdValue === '') {
                this.props.updatePool(undefined);
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              const isValid = validateAndSetPool(poolIdValue, this.props.updatePool);
              if (this.props.poolQueryError != null) {
                return [false]; // no error message since container already displays one
              }
              return [isValid, this.context.intl.formatMessage(messages.invalidPoolId)];
            },
          ],
        },
      },
    },
    {
      options: {
        showErrorsOnInit: false, // TODO: support URI
        validateOnBlur: false,
        validateOnChange: true,
        validationDebounceWait: 0,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  render(): Node {
    const { form } = this;
    const { intl } = this.context;

    const poolIdField = form.$('poolId');

    const pendingTxWarningComponent = (
      <div className={styles.warningBox}>
        <WarningBox>{intl.formatMessage(globalMessages.pendingTxWarning)}</WarningBox>
      </div>
    );

    const poolQueryError =
      this.props.poolQueryError == null ? this.props.poolQueryError : intl.formatMessage(this.props.poolQueryError);

    return (
      <Box className={styles.component}>
        {this.props.hasAnyPending && pendingTxWarningComponent}

        <BorderedBox>
          <div className={styles.poolInput}>
            <TextField
              className="poolId"
              {...poolIdField.bind()}
              error={poolIdField.error || poolQueryError}
              done={poolIdField.isValid}
            />
          </div>
          {this._makeInvokeConfirmationButton()}
        </BorderedBox>
      </Box>
    );
  }

  _makeInvokeConfirmationButton(): Node {
    const { intl } = this.context;

    return (
      <Button
        variant="primary"
        onClick={this.props.onNext}
        disabled={this.props.hasAnyPending || this.props.isProcessing || this.props.poolQueryError != null}
        sx={{ margin: '30px auto 0', display: 'block' }}
      >
        {intl.formatMessage(globalMessages.nextButtonLabel)}
      </Button>
    );
  }
}
