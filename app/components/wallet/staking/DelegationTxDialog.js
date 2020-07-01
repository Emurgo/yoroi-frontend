// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import AmountInputSkin from '../skins/AmountInputSkin';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './DelegationTxDialog.scss';
import config from '../../../config';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import WarningBox from '../../widgets/WarningBox';

const messages = defineMessages({
  explanationLine1: {
    id: 'wallet.delegation.transaction.explanationLine1',
    defaultMessage: '!!!You can only delegate to one stake pool at a time',
  },
  explanationLine2: {
    id: 'wallet.delegation.transaction.explanationLine2',
    defaultMessage: '!!!You can switch to delegate to a different stake pool at any time',
  },
  explanationLine3: {
    id: 'wallet.delegation.transaction.explanationLine3',
    defaultMessage: '!!!You can cancel your delegation at any time',
  },
  stakePoolName: {
    id: 'wallet.delegation.transaction.stakePoolName',
    defaultMessage: '!!!Stake pool name',
  },
  stakePoolHash: {
    id: 'wallet.delegation.transaction.stakePoolHash',
    defaultMessage: '!!!Stake pool hash',
  },
  approximateLabel: {
    id: 'wallet.delegation.transaction.approximationLabel',
    defaultMessage: '!!!Current approximation of rewards that you will receive per epoch:',
  }
});

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: SelectedExplorer,
  +poolName: null | string,
  +poolHash: string,
  +amountToDelegate: BigNumber,
  +transactionFee: BigNumber,
  +approximateReward: BigNumber,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +classicTheme: boolean,
  +error: ?LocalizableError,
  +meta: {|
    +totalSupply: BigNumber,
    +decimalPlaces: number,
  |},
|};

@observer
export default class DelegationTxDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder) : '',
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

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const walletPasswordField = form.$('walletPassword');

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
      this.props.isSubmitting ? styles.submitButtonSpinning : null,
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        disabled: this.props.isSubmitting,
        onClick: this.props.isSubmitting
          ? () => {} // noop
          : this.props.onCancel
      },
      {
        label: intl.formatMessage(globalMessages.delegateLabel),
        onClick: this.submit.bind(this),
        primary: true,
        className: confirmButtonClasses,
        isSubmitting: this.props.isSubmitting,
        disabled: !walletPasswordField.isValid || this.props.isSubmitting,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={!this.props.isSubmitting ? this.props.onCancel : null}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
      >
        {this.props.staleTx && staleTxWarning}
        <ul className={styles.explanation}>
          <li>
            {intl.formatMessage(messages.explanationLine1)}
          </li>
          <li>
            {intl.formatMessage(messages.explanationLine2)}
          </li>
          <li>
            {intl.formatMessage(messages.explanationLine3)}
          </li>
        </ul>
        <div className={styles.headerBlock}>
          <p className={styles.header}>{intl.formatMessage(messages.stakePoolName)}</p>
          <p className={styles.content}>{
            this.props.poolName ?? intl.formatMessage(globalMessages.unknownPoolLabel)
          }
          </p>
        </div>
        <div className={styles.headerBlock}>
          <p className={styles.header}>{intl.formatMessage(messages.stakePoolHash)}</p>
          <div className={styles.content}>
            <ExplorableHashContainer
              selectedExplorer={this.props.selectedExplorer}
              hash={this.props.poolHash}
              light
              linkType="pool"
              tooltipOpensUpward // otherwise it overlaps with amount field
            >
              <RawHash light>
                {this.props.poolHash}
              </RawHash>
            </ExplorableHashContainer>
          </div>
        </div>

        <div className={styles.amountInput}>
          <NumericInput
            className="amount"
            label={intl.formatMessage(globalMessages.amountLabel)}
            maxBeforeDot={
              this.props.meta.totalSupply.div(this.props.meta.decimalPlaces).toFixed().length
            }
            maxAfterDot={this.props.meta.decimalPlaces}
            disabled
            // AmountInputSkin props
            currency={intl.formatMessage(globalMessages.unitAda)}
            fees={this.props.transactionFee.toFormat(this.props.meta.decimalPlaces)}
            // note: we purposely don't put "total" since it doesn't really make sense here
            // since the fee is unrelated to the amount you're about to stake
            total=""
            value={this.props.amountToDelegate
              .shiftedBy(-this.props.meta.decimalPlaces)
              .toFormat(this.props.meta.decimalPlaces)
            }
            skin={AmountInputSkin}
            classicTheme={this.props.classicTheme}
          />
        </div>
        <div className={styles.walletPasswordFields}>
          <Input
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            disabled={this.props.isSubmitting}
            error={walletPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>
        <div className={styles.headerBlock}>
          <p className={styles.header}>{intl.formatMessage(messages.approximateLabel)}</p>
          <p className={styles.rewardAmount}>
            {this.props.approximateReward.toFormat(this.props.meta.decimalPlaces)}&nbsp;
            {intl.formatMessage(globalMessages.unitAda).toUpperCase()}
          </p>
        </div>
        {this.props.error
          ? <p className={styles.error}>{intl.formatMessage(this.props.error)}</p>
          : null
        }

      </Dialog>
    );
  }
}
