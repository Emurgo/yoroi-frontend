// @flow
import { Component } from 'react';
import type { Node } from 'react';
import styles from './SingleTokenRow.scss';
import { ReactComponent as NoAssetLogo } from '../../../../assets/images/assets-page/asset-no.inline.svg';
import {
  truncateAddressShort,
  formattedAmountToNaturalUnits,
  formattedAmountToBigNumber,
  splitAmount,
} from '../../../../utils/formatters';
import BigNumber from 'bignumber.js';
import { defineMessages, intlShape } from 'react-intl';
import { AmountInputRevamp } from '../../../common/NumericInputRP';
import { ReactComponent as CloseIcon } from '../../../../assets/images/forms/close-small.inline.svg';
import type { FormattedTokenDisplay } from '../../../../utils/wallet';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames from 'classnames';
import { Box, Typography } from '@mui/material';

type Props = {|
  +token: FormattedTokenDisplay,
  +updateAmount: ($ReadOnly<TokenRow>, BigNumber | null) => void,
  +onRemoveToken: ($ReadOnly<TokenRow>) => void,
  +isTokenIncluded: ($ReadOnly<TokenRow>) => boolean,
  +onAddToken: ($ReadOnly<TokenRow>) => void,
  +getTokenAmount: ($ReadOnly<TokenRow>) => ?BigNumber,
  +isValidAmount: ($ReadOnly<TokenRow>) => boolean,
|};

type State = {|
  isInputFocused: boolean,
|};

const messages = defineMessages({
  notEnoughMoneyToSendError: {
    id: 'api.errors.NotEnoughMoneyToSendError',
    defaultMessage: '!!!Not enough balance',
  },
});
export default class SingleTokenRow extends Component<Props,State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };


  constructor(props: Props) {
    super(props);
    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      isInputFocused: false,
    };
  }

  getNumDecimals(): number {
    return this.props.token.info.Metadata.numberOfDecimals;
  }

  onAmountUpdate(value: string | null): void {
    const formattedAmount =
      value !== null && value !== ''
        ? new BigNumber(formattedAmountToNaturalUnits(value, this.getNumDecimals()))
        : null;
    if (formattedAmount && formattedAmount.isNegative()) return;
    this.props.updateAmount(this.props.token.info, formattedAmount);
  }

  render(): Node {
    const { intl } = this.context;
    const { token, isValidAmount } = this.props;
    const isValid = isValidAmount(token.info);

    const numberOfDecimals = this.getNumDecimals();
    let amount = this.props.getTokenAmount(token.info);
    if (amount) {
      amount = amount.shiftedBy(-numberOfDecimals).toString();
    }

    const displayAmount = token.amount
      ? splitAmount(new BigNumber(token.amount), numberOfDecimals).join('')
      : '0';

    return (
      <div className={styles.component}>
        {!this.props.isTokenIncluded(token.info) ? (
          <button
            type="button"
            className={styles.token}
            onClick={() => this.props.onAddToken(token.info)}
          >
            <div className={styles.name}>
              <div className={styles.logo}>
                <NoAssetLogo />
              </div>
              <Typography component="div" variant="body1" color="primary.600" className={styles.label}>
                {token.label.startsWith('asset')
                  ? truncateAddressShort(token.label, 14)
                  : token.label}
              </Typography>
            </div>
            <Typography component="div" variant="body1" color="grayscale.900">
              {truncateAddressShort(token.id, 14)}
            </Typography>
            <Typography variant="body1" color="grayscale.900" className={styles.amount}>{displayAmount}</Typography>
          </button>
        ) : (
          <Box
            border="2px solid"
            borderColor="grayscale.400"
            className={
              classnames([styles.amountWrapper,
                !isValid && styles.amountError,this.state.isInputFocused && styles.inputFocused])
            }
          >
            <div className={styles.amountTokenName}>
              <div className={styles.logo}>
                <NoAssetLogo />
              </div>
              <Typography component="div" variant="body1" color="primary.600" className={styles.label}>
                {token.label}
              </Typography>
            </div>
            <div>
              <Typography component="div" variant="body1" color="grayscale.900">
                {truncateAddressShort(token.id, 14)}
              </Typography>
            </div>
            <div className={styles.amountInput}>
              <AmountInputRevamp
                value={!amount ? null : formattedAmountToBigNumber(amount)}
                onChange={this.onAmountUpdate.bind(this)}
                decimalPlaces={this.getNumDecimals()}
                amountFieldRevamp
                placeholder={displayAmount}
                onFocus={() => {
                  this.setState({ isInputFocused: true })
                }}
                onBlur={() => {
                  this.setState({ isInputFocused: false })
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => this.props.onRemoveToken(token.info)}
              className={styles.close}
            >
              {' '}
              <CloseIcon />{' '}
            </button>
            <div className={styles.error}>
              {!isValid && intl.formatMessage(messages.notEnoughMoneyToSendError)}
            </div>
          </Box>
        )}
      </div>
    );
  }
}
