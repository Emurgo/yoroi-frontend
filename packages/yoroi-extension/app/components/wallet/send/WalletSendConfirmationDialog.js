// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import React, { Component, } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import TextField from '../../common/TextField';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './WalletSendConfirmationDialog.scss';
import config from '../../../config';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  truncateAddress, truncateToken,
} from '../../../utils/formatters';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey, TokenEntry,
} from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName, genFormatTokenAmount } from '../../../stores/stateless/tokenHelpers';
import { Box } from '@mui/system';

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: SelectedExplorer,
  +amount: MultiToken,
  +receivers: Array<string>,
  +totalAmount: MultiToken,
  +transactionFee: MultiToken,
  +transactionSize: ?string,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +addressToDisplayString: string => string,
  +onCancel: void => void,
  +isSubmitting: boolean,
  +error: ?LocalizableError,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +getCurrentPrice: (from: string, to: string) => ?string,
|};

@observer
export default class WalletSendConfirmationDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: '',
        value: '',
        validators: [({ field }) => {
          if (field.value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          return [true];
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

  submit(): void {
    this.form.submit({
      onSuccess: async (form) => {
        const { walletPassword } = form.values();
        const transactionData = {
          password: walletPassword,
        };
        await this.props.onSubmit(transactionData);
      },
      onError: () => {}
    });
  }

  renderSingleAmount: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return  (
      <div className={styles.amount}>{formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
          truncateToken(getTokenName(this.props.getTokenInfo(entry)))
        }
        </span>
      </div>
    );
  }
  renderTotalAmount: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return  (
      <div className={styles.totalAmount}>{formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
          truncateToken(getTokenName(this.props.getTokenInfo(entry)))
        }
        </span>
      </div>
    );
  }
  renderSingleFee: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return  (
      <div className={styles.fees}>
        +{formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
          truncateToken(getTokenName(this.props.getTokenInfo(
            entry
          )))
        }
        </span>
      </div>
    );
  }

  renderBundle: {|
    amount: MultiToken,
    render: TokenEntry => Node,
  |} => Node = (request) => {
    return (
      <>
        {request.render(request.amount.getDefaultEntry())}
        {request.amount.nonDefaultEntries().map(entry => (
          <React.Fragment key={entry.identifier}>
            {request.render(entry)}
          </React.Fragment>
        ))}
      </>
    );
  }

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const walletPasswordField = form.$('walletPassword');
    const {
      onCancel,
      amount,
      receivers,
      isSubmitting,
      error,
    } = this.props;

    const staleTxWarning = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}<br />
          {intl.formatMessage(globalMessages.staleTxnWarningLine2)}
        </WarningBox>
      </div>
    );

    const confirmButtonClasses = classnames([
      'confirmButton',
      isSubmitting ? styles.submitButtonSpinning : null,
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        disabled: isSubmitting,
        onClick: onCancel,
      },
      {
        label: intl.formatMessage(globalMessages.sendButtonLabel),
        onClick: this.submit.bind(this),
        primary: true,
        className: confirmButtonClasses,
        isSubmitting,
        disabled: !walletPasswordField.isValid,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        dialogActions={actions}
        closeOnOverlayClick={false}
        onClose={!isSubmitting ? onCancel : null}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
      >
        {this.props.staleTx && staleTxWarning}

        <div className={styles.walletPasswordFields}>
          <div className={styles.addressToLabelWrapper}>
            <div className={styles.addressToLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationAddressToLabel)}
            </div>
            {[...new Set(receivers)].map((receiver, i) => (
              <Box>
                <ExplorableHashContainer
                  key={receiver + i} // eslint-disable-line react/no-array-index-key
                  selectedExplorer={this.props.selectedExplorer}
                  hash={this.props.addressToDisplayString(receiver)}
                  light
                  linkType="address"
                >
                  <RawHash light>
                    <span className={styles.addressTo}>
                      {truncateAddress(this.props.addressToDisplayString(receiver))}
                    </span>
                  </RawHash>
                </ExplorableHashContainer>
              </Box>
            ))}
          </div>

          {this.props.transactionSize != null ? (
            <div className={styles.addressToLabelWrapper}>
              <div className={styles.addressToLabel}>
                {intl.formatMessage(globalMessages.walletSendConfirmationTxSizeLabel)}
              </div>
              <span className={styles.txSize}>
                {this.props.transactionSize}
              </span>
            </div>
          ) : null}

          <div className={styles.amountFeesWrapper}>
            <div className={styles.amountWrapper}>
              <div className={styles.amountLabel}>
                {intl.formatMessage(globalMessages.amountLabel)}
              </div>
              {this.renderBundle({
                amount,
                render: this.renderSingleAmount,
              })}
            </div>

            <div className={styles.feesWrapper}>
              <div className={styles.feesLabel}>
                {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
              </div>
              {this.renderBundle({
                amount: this.props.transactionFee,
                render: this.renderSingleFee,
              })}
            </div>
          </div>

          <div className={styles.totalAmountWrapper}>
            <div className={styles.totalAmountLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
            </div>
            {this.renderBundle({
              amount: this.props.totalAmount,
              render: this.renderTotalAmount,
            })}
          </div>

          <TextField
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            disabled={isSubmitting}
            error={walletPasswordField.error}
          />
        </div>

        {error
          ? (
            <div className={styles.error}>
              {intl.formatMessage(error, error.values)}
            </div>
          )
          : null
        }

      </Dialog>
    );
  }
}
