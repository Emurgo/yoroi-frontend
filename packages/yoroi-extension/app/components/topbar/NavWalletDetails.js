// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape, } from 'react-intl';
import { truncateToken } from '../../utils/formatters';

import globalMessages from '../../i18n/global-messages';
import styles from './NavWalletDetails.scss';
import { ReactComponent as IconEyeOpen } from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import WalletCurrency from '../wallet/my-wallets/WalletCurrency';
import { hiddenAmount } from '../../utils/strings';
import type { TokenLookupKey, } from '../../api/common/lib/MultiToken';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { Box } from '@mui/system';
import { maybe } from '../../coreUtils';

type Props = {|
  +onUpdateHideBalance: void => Promise<void>,
  +shouldHideBalance: boolean,
  +highlightTitle?: boolean,
  +showEyeIcon?: boolean,
  +rewards: MultiToken,
  +walletAmount: ?MultiToken,
  +infoText?: string,
  +showDetails?: boolean,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +purpose: 'allWallets' | 'topBar',
|};

@observer
export default class NavWalletDetails extends Component<Props> {

  static defaultProps: {|
    highlightTitle: boolean,
    infoText: void,
    showDetails: boolean,
    showEyeIcon: boolean,
  |} = {
    highlightTitle: false,
    infoText: undefined,
    showDetails: true,
    showEyeIcon: true,
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

    const showsRewards = showDetails === true;
    const showEyeIconSafe = showEyeIcon != null && showEyeIcon;
    const { unitOfAccountSetting } = this.props;
    return (
      <div className={styles.wrapper}>
        <div className={styles.outerWrapper}>
          {
          !totalAmount || (totalAmount && showsRewards && !walletAmount) ? (
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
                  (!unitOfAccountSetting.enabled && showsRewards) && styles.currencyAlign
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
                {unitOfAccountSetting.enabled ? (
                  <div className={styles.fiat}>
                    {this.renderAmountDisplay({
                      shouldHideBalance,
                      amount: totalAmount,
                      convertToFiat: true,
                    })}
                  </div>
                ) : (
                  <>
                    {showsRewards &&
                    <div className={styles.details}>
                      <div>
                        <div className={styles.label}>
                          {intl.formatMessage(globalMessages.walletLabel)}&nbsp;
                        </div>
                        {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
                      </div>
                      <div>
                        <div className={styles.label}>
                          {intl.formatMessage(globalMessages.rewardsLabel)}&nbsp;
                        </div>
                        {this.renderAmountDisplay({ shouldHideBalance, amount: rewards })}
                      </div>
                    </div>
                    }
                  </>
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

  getTotalAmount: void => ?MultiToken = () => {
    return maybe(this.props.walletAmount,
      w => this.props.rewards.joinAddCopy(w))
  }

  renderAmountDisplay: {|
    shouldHideBalance: boolean,
    amount: ?MultiToken,
    convertToFiat?: ?boolean,
  |} => Node = (request) => {
    if (request.amount == null) {
      throw new Error('Amount is required to be rendered')
    }

    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    let balanceDisplay = shiftedAmount
      .decimalPlaces(tokenInfo.Metadata.numberOfDecimals)
      .toString();

    let unit = truncateToken(getTokenName(tokenInfo));

    if (Boolean(request.convertToFiat)) {
      const { currency } = this.props.unitOfAccountSetting;
      if (currency == null || currency.trim().length === 0) {
        throw new Error('expect unit of account currency setting');
      }
      const ticker = tokenInfo.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      const price = this.props.getCurrentPrice(ticker, currency);
      if (price != null) {
        balanceDisplay = calculateAndFormatValue(shiftedAmount, price);
      } else {
        balanceDisplay = '-';
      }
      unit = currency;
    }

    if (request.shouldHideBalance) {
      balanceDisplay = (<span>{hiddenAmount}</span>);
    }

    return (<>{balanceDisplay} {unit}</>);
  }
}
