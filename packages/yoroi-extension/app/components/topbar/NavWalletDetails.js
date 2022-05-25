// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import classnames from 'classnames';
import { intlShape, } from 'react-intl';
import { truncateToken } from '../../utils/formatters';

import globalMessages from '../../i18n/global-messages';
import styles from './NavWalletDetails.scss';
import { ReactComponent as IconEyeOpen }  from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import { ReactComponent as IconEyeClosed }  from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import WalletCurrency from '../wallet/my-wallets/WalletCurrency';
import { hiddenAmount } from '../../utils/strings';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type {
  TokenLookupKey,
} from '../../api/common/lib/MultiToken';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { Box } from '@mui/system';

type Props = {|
  +onUpdateHideBalance: void => Promise<void>,
  +shouldHideBalance: boolean,
  +highlightTitle?: boolean,
  +showEyeIcon?: boolean,
  /**
    * undefined => wallet is not a reward wallet
    * null => still calculating
    * value => done calculating
  */
  +rewards: null | void | MultiToken,
  +walletAmount: null | MultiToken,
  +infoText?: string,
  +showDetails?: boolean,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>,
  +purpose?: 'allWallets' | 'topBar',
|};

@observer
export default class NavWalletDetails extends Component<Props> {

  static defaultProps: {|
    highlightTitle: boolean,
    infoText: void,
    showDetails: boolean,
    showEyeIcon: boolean,
    purpose: void,
  |} = {
    highlightTitle: false,
    infoText: undefined,
    showDetails: true,
    showEyeIcon: true,
    purpose: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      shouldHideBalance,
      onUpdateHideBalance,
      highlightTitle,
      rewards,
      walletAmount,
      infoText,
      showDetails,
      showEyeIcon,
      purpose
    } = this.props;

    const { intl } = this.context;

    const totalAmount = this.getTotalAmount();

    const showsRewards = (
      this.props.rewards !== undefined &&
      showDetails !== null &&
      showDetails === true
    );
    const showEyeIconSafe = showEyeIcon != null && showEyeIcon;
    return (
      <div className={styles.wrapper}>
        <div className={styles.outerWrapper}>
          {
          !totalAmount || (totalAmount && showsRewards && (!rewards || !walletAmount)) ? (
            <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: purpose === 'allWallets' ? '180px' : '100%'
            }}
            >
              <LoadingSpinner small />
            </Box>
          ) : (
            <>
              <div
                className={classnames([
                  styles.currency,
                  showsRewards && styles.currencyAlign
                ])}
              >
                <WalletCurrency currency={getTokenName(this.props.defaultToken)} />
              </div>
              <div className={styles.content}>
                <div
                  className={classnames([
                    styles.amount,
                    highlightTitle !== null && highlightTitle === true && styles.highlightAmount
                  ])}
                >
                  {this.renderAmountDisplay({
                    shouldHideBalance,
                    amount: totalAmount
                  })}
                </div>
                {showsRewards &&
                <div className={styles.details}>
                  <div>
                    <p className={styles.label}>
                      {intl.formatMessage(globalMessages.walletLabel)}&nbsp;
                    </p>
                    {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
                  </div>
                  <div>
                    <p className={styles.label}>
                      {intl.formatMessage(globalMessages.rewardsLabel)}&nbsp;
                    </p>
                    {this.renderAmountDisplay({ shouldHideBalance, amount: rewards })}
                  </div>
                </div>
                }
                {this.props.rewards === undefined && (
                <div className={styles.info}>
                  {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
                </div>
                )}
              </div>
            </>
          )}
          {showEyeIconSafe &&
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onUpdateHideBalance}
          >
            {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
          </button>
          }
        </div>
        {infoText != null && (
          <div className={styles.info}>
            {infoText}
          </div>
        )}
      </div>
    );
  }

  getTotalAmount: void => (null | MultiToken) = () => {
    if (this.props.rewards === undefined) {
      return this.props.walletAmount;
    }
    if (this.props.rewards === null || this.props.walletAmount === null) {
      return null;
    }
    return this.props.walletAmount.joinAddCopy(this.props.rewards);
  }

  renderAmountDisplay: {|
    shouldHideBalance: boolean,
    amount: ?MultiToken
  |} => Node = (request) => {
    if (request.amount == null) {
      return <div className={styles.isLoading} />;
    }

    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .decimalPlaces(tokenInfo.Metadata.numberOfDecimals)
      .toString();

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = (<span>{hiddenAmount}</span>);
    } else {
      balanceDisplay = (
        <>
          {shiftedAmount}
        </>
      );
    }

    return (<>{balanceDisplay} {truncateToken(getTokenName(tokenInfo))}</>);
  }
}
