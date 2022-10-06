// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import classnames from 'classnames';
import { AmountInput } from '../../common/NumericInputRP';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './DelegationTxDialog.scss';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import SpendingPasswordInput from '../../widgets/forms/SpendingPasswordInput';
import { truncateToken } from '../../../utils/formatters';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey,
} from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName, genFormatTokenAmount, } from '../../../stores/stateless/tokenHelpers';

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
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +amountToDelegate: MultiToken,
  +transactionFee: MultiToken,
  +approximateReward: {|
    +amount: BigNumber,
    +token: $ReadOnly<TokenRow>,
  |},
  +isHardware: boolean,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +onSubmit: ({| password?: string |}) => PossiblyAsync<void>,
  +classicTheme: boolean,
  +error: ?LocalizableError,
|};

@observer
export default class DelegationTxDialog extends Component<Props> {

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
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
      onSuccess: async (form) => {
        const { walletPassword } = form.values();
        await this.props.onSubmit({ password: walletPassword });
      },
      onError: () => {}
    });
  }

  render(): Node {
    const { intl } = this.context;

    const spendingPasswordForm = this.props.isHardware
      ? undefined
      : (
        <SpendingPasswordInput
          setForm={(form) => this.setSpendingPasswordForm(form)}
          classicTheme={this.props.classicTheme}
          isSubmitting={this.props.isSubmitting}
        />
      );

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
        disabled: this.props.isSubmitting,
      },
    ];

    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    const decimalPlaces = this.props.getTokenInfo(
      this.props.amountToDelegate.getDefaultEntry()
    ).Metadata.numberOfDecimals;
    const delegatingValue = new BigNumber(
      this.props.amountToDelegate.getDefaultEntry().amount
    ).shiftedBy(-decimalPlaces);
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
          <p className={styles.header}>{intl.formatMessage(globalMessages.stakePoolHash)}</p>
          <div className={styles.content}>
            <ExplorableHashContainer
              selectedExplorer={this.props.selectedExplorer}
              hash={this.props.poolHash}
              light
              linkType="pool"
              placementTooltip="top-start"
            >
              <RawHash light>
                {this.props.poolHash}
              </RawHash>
            </ExplorableHashContainer>
          </div>
        </div>

        <div className={styles.amountInput}>
          <AmountInput
            className="amount"
            label={intl.formatMessage(globalMessages.amountLabel)}
            decimalPlaces={decimalPlaces}
            disabled
            currency={getTokenName(
              this.props.getTokenInfo(
                this.props.amountToDelegate.getDefaultEntry()
              )
            )}
            fees={formatValue(this.props.transactionFee.getDefaultEntry())}
            // note: we purposely don't put "total" since it doesn't really make sense here
            // since the fee is unrelated to the amount you're about to stake
            total=""
            value={delegatingValue}
          />
        </div>
        <div className={styles.walletPasswordFields}>
          {spendingPasswordForm}
        </div>
        <div className={styles.headerBlock}>
          <p className={styles.header}>{intl.formatMessage(messages.approximateLabel)}</p>
          <p className={styles.rewardAmount}>
            {this.props.approximateReward.amount
              .shiftedBy(-this.props.approximateReward.token.Metadata.numberOfDecimals)
              .toFormat(this.props.approximateReward.token.Metadata.numberOfDecimals)
            }&nbsp;
            {truncateToken(getTokenName(this.props.approximateReward.token))}
          </p>
        </div>
        {this.props.error
          ? (
            <p className={styles.error}>
              {intl.formatMessage(this.props.error, this.props.error.values)}
            </p>
          )
          : null
        }

      </Dialog>
    );
  }
}
