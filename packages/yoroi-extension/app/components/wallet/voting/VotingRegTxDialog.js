// @flow

/* eslint react/jsx-one-expression-per-line: 0 */ // the &nbsp; in the html breaks this

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import classnames from 'classnames';

import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import DialogBackButton from '../../widgets/DialogBackButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './VotingRegTxDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import SpendingPasswordInput from '../../widgets/forms/SpendingPasswordInput';
import { AmountInput } from '../../common/NumericInputRP';
import { ProgressInfo } from '../../../stores/ada/VotingStore';
import ProgressStepBlock from './ProgressStepBlock';
import WarningBox from '../../widgets/WarningBox';
import { getTokenName, genFormatTokenAmount } from '../../../stores/stateless/tokenHelpers';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { truncateToken } from '../../../utils/formatters';

import { MultiToken } from '../../../api/common/lib/MultiToken';
import type { WalletType, StepsList } from './types';
import Stepper from '../../common/stepper/Stepper';
import { Typography } from '@mui/material';

const messages = defineMessages({
  line1: {
    id: 'wallet.voting.dialog.step.trx.line1',
    defaultMessage: '!!!Confirm your password to register in the blockchain the certificate previously generated for voting.',
  },
  txConfirmationTrezorTLine1: {
    id: 'wallet.voting.dialog.step.trx.trezor.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Register button.',
  },
  txConfirmationLedgerNanoLine1: {
    id: 'wallet.voting.dialog.step.trx.ledger.info.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Register button.',
  },
});

type Props = {|
  +stepsList: StepsList,
  +progressInfo: ProgressInfo,
  +staleTx: boolean,
  +transactionFee: MultiToken,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +goBack: void => void,
  +onSubmit: ({| password?: string |}) => PossiblyAsync<void>,
  +classicTheme: boolean,
  +error: ?LocalizableError,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +walletType: WalletType,
  +isRevamp: boolean,
|};

@observer
export default class VotingRegTxDialog extends Component<Props> {
  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  submit(): void {
    if (this.spendingPasswordForm == null) {
      this.props.onSubmit(Object.freeze({}));
      return;
    }
    this.spendingPasswordForm.submit({
      onSuccess: async form => {
        const { walletPassword } = form.values();
        await this.props.onSubmit({ password: walletPassword });
      },
      onError: () => {},
    });
  }

  renderInfoBlock(): Node {
    const { walletType } = this.props;
    const { intl } = this.context;

    if (walletType === 'mnemonic') {
      return (
        <Typography className={classnames([styles.lineText, styles.firstItem])} color="ds.text_gray_normal">
          {intl.formatMessage(messages.line1)}
        </Typography>
      );
    }

    let infoLine1;
    let infoLine2;
    if (walletType === 'trezorT') {
      infoLine1 = messages.txConfirmationTrezorTLine1;
      infoLine2 = globalMessages.txConfirmationTrezorTLine2;
    } else if (walletType === 'ledgerNano') {
      infoLine1 = messages.txConfirmationLedgerNanoLine1;
      infoLine2 = globalMessages.txConfirmationLedgerNanoLine2;
    } else {
      throw new Error(`${nameof(VotingRegTxDialog)} impossible wallet type`);
    }

    return (
      <div className={styles.infoBlock}>
        <ul>
          <li key="1">
            <span>{intl.formatMessage(infoLine1)}</span>
            <br />
          </li>
          <li key="2">
            <span>{intl.formatMessage(infoLine2)}</span>
            <br />
          </li>
        </ul>
      </div>
    );
  }

  render(): Node {
    const { intl } = this.context;

    const spendingPasswordForm =
      this.props.walletType === 'mnemonic' ? (
        <SpendingPasswordInput
          setForm={form => this.setSpendingPasswordForm(form)}
          classicTheme={this.props.classicTheme}
          isSubmitting={this.props.isSubmitting}
        />
      ) : undefined; // hardware wallet

    const staleTxWarning = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}
          <br />
          {intl.formatMessage(globalMessages.staleTxnWarningLine2)}
        </WarningBox>
      </div>
    );

    const confirmButtonClasses = classnames(['confirmButton', this.props.isSubmitting ? styles.submitButtonSpinning : null]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.registerLabel),
        onClick: this.submit.bind(this),
        primary: true,
        className: confirmButtonClasses,
        isSubmitting: this.props.isSubmitting,
        disabled: this.props.isSubmitting,
      },
    ];

    const tokenInfo = this.props.getTokenInfo(this.props.transactionFee.getDefaultEntry());
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={!this.props.isSubmitting ? this.props.onCancel : null}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
        backButton={<DialogBackButton onBack={this.props.goBack} />}
      >
        {this.props.isRevamp ? (
          <Stepper
            currentStep={String(this.props.progressInfo.currentStep)}
            steps={this.props.stepsList.map(step => ({
              message: step.message,
              stepId: String(step.step),
            }))}
            setCurrentStep={() => {}}
          />
        ) : (
          <ProgressStepBlock
            stepsList={this.props.stepsList}
            progressInfo={this.props.progressInfo}
            classicTheme={this.props.classicTheme}
          />
        )}
        {this.props.staleTx && staleTxWarning}

        {this.renderInfoBlock()}

        <div className={styles.amountInput}>
          <AmountInput
            className="amount"
            label={intl.formatMessage(globalMessages.amountLabel)}
            decimalPlaces={tokenInfo.Metadata.numberOfDecimals}
            disabled
            currency={truncateToken(getTokenName(tokenInfo))}
            fees={formatValue(this.props.transactionFee.getDefaultEntry())}
            // note: we purposely don't put "total" since it doesn't really make sense here
            // since the fee is unrelated to the amount you're about to register
            total=""
            value={new BigNumber(0)}
            allowSigns={false}
          />
        </div>
        {spendingPasswordForm}
        {this.props.error ? (
          <div className={styles.error}>{intl.formatMessage(this.props.error, this.props.error.values)}</div>
        ) : null}
      </Dialog>
    );
  }
}
