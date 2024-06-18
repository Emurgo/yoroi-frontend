// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import styles from './WalletDetails.scss';
import { ReactComponent as IconEyeOpen } from '../../../assets/images/my-wallets/icon_eye_open.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { hiddenAmount } from '../../../utils/strings';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +onUpdateHideBalance: void => Promise<void>,
  +shouldHideBalance: boolean,
  +rewards: ?MultiToken,
  +walletAmount: ?MultiToken,
  +infoText?: string,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isRefreshing: boolean,
|};

@observer
export default class WalletDetails extends Component<Props> {
  static defaultProps: {| infoText: void |} = {
    infoText: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      shouldHideBalance,
      onUpdateHideBalance,
      walletAmount,
      // rewards
    } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {/* <div className={classnames([styles.amount, styles.amountBold])}>
            {this.renderAmountDisplay({
              shouldHideBalance,
              amount: walletAmount != null && rewards != null
                ? walletAmount.joinAddCopy(rewards)
                : null
            })}
            <span className={styles.amountLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
            </span>
          </div> */}
          <div className={styles.amount}>
            {this.renderAmountDisplay({
              shouldHideBalance,
              amount: walletAmount,
            })}
            <span className={styles.amountLabel}>
              {intl.formatMessage(globalMessages.walletLabel)}
            </span>
          </div>
          {/* <div className={styles.amount}>
            {this.renderAmountDisplay({ shouldHideBalance, amount: rewards })}
            <span className={styles.amountLabel}>
              {intl.formatMessage(globalMessages.rewardsLabel)}
            </span>
          </div> */}
        </div>
        <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
          {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
        </button>
      </div>
    );
  }

  renderAmountDisplay: ({|
    shouldHideBalance: boolean,
    amount: ?MultiToken,
  |}) => Node = request => {
    if (request.amount == null) {
      return <div className={styles.isLoading} />;
    }

    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = <span>{hiddenAmount}</span>;
    } else {
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
        shiftedAmount,
        tokenInfo.Metadata.numberOfDecimals
      );

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (
      <>
        {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
        {this.props.isRefreshing && <div className={styles.isSyncing} />}
      </>
    );
  };
}
