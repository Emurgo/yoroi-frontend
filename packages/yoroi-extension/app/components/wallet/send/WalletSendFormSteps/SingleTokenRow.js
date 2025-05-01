// @flow
import { Component } from 'react';
import type { Node } from 'react';
import styles from './SingleTokenRow.scss';
import {
  truncateAddressShort,
  formattedAmountToNaturalUnits,
  formattedAmountToBigNumber,
  splitAmount,
} from '../../../../utils/formatters';
import BigNumber from 'bignumber.js';
import { defineMessages, IntlContext } from 'react-intl';
import { AmountInputRevamp } from '../../../common/NumericInputRP';
import { ReactComponent as CloseIcon } from '../../../../assets/images/forms/close-small.inline.svg';
import type { FormattedTokenDisplay } from '../../../../utils/wallet';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames from 'classnames';
import { Box, Typography, styled } from '@mui/material';
import TokenImage from './TokenImage';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.gray_max,
    },
    '& rect': {
      fill: theme.palette.ds.bg_color_contrast_min,
    },
  },
}));

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
export default class SingleTokenRow extends Component<Props, State> {
  static contextType = IntlContext;
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
      value !== null && value !== '' ? new BigNumber(formattedAmountToNaturalUnits(value, this.getNumDecimals())) : null;
    if (formattedAmount && formattedAmount.isNegative()) return;
    this.props.updateAmount(this.props.token.info, formattedAmount);
  }

  render(): Node {
    const intl = this.context;
    const { token, isValidAmount } = this.props;
    const isNotValid = !isValidAmount(token.info);

    const numberOfDecimals = this.getNumDecimals();
    let amount = this.props.getTokenAmount(token.info);
    if (amount) {
      amount = amount.shiftedBy(-numberOfDecimals).toString();
    }

    const displayAmount = token.amount ? splitAmount(new BigNumber(token.amount), numberOfDecimals).join('') : '0';

    const includedBorderColor = isNotValid ? 'ds.sys_magenta_500' : 'ds.el_gray_min';
    const activeInputErrorBorderColor = isNotValid ? 'ds.sys_magenta_500' : 'ds.el_gray_max';
    const tokenRowBorderColor = this.props.isTokenIncluded(token.info) ? includedBorderColor : 'transparent';
    const activeInputBorderColor = this.state.isInputFocused ? activeInputErrorBorderColor: tokenRowBorderColor;

    const hoverNotActiveInputBorderColor = this.props.isTokenIncluded(token.info) ? includedBorderColor : 'ds.gray_200';
    const hoverBorderColor = this.state.isInputFocused ? activeInputErrorBorderColor : hoverNotActiveInputBorderColor;

    return (
      <div className={styles.component}>
        <Box
          type="button"
          className={classnames(styles.token, {
            [styles.amountWrapper]: true,
          })}
          onClick={!this.props.isTokenIncluded(token.info) ? () => this.props.onAddToken(token.info) : null}
          sx={{
            border: '2px solid',
            borderColor: activeInputBorderColor,
            '&:hover': { border: '2px solid', borderColor: hoverBorderColor },
          }}
        >
          <div className={styles.amountTokenName}>
            <Box
              width={30}
              height={30}
              marginRight="16px"
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                overflow: 'hidden',
                '> img': {
                  objectFit: 'cover',
                  display: 'inline-block',
                  borderRadius: '4px',
                },
              }}
            >
              <TokenImage image={token.info.Metadata.logo ?? null} name={token.label} width="30px" height="30px" />
            </Box>
            <Typography component="div" variant="body1" color="primary.600" className={styles.label}>
              {truncateAddressShort(token.label, token.label.startsWith('asset') ? 14 : 12)}
            </Typography>
          </div>
          <Typography component="div" variant="body1" color="grayscale.900">
            {truncateAddressShort(token.id, 14)}
          </Typography>

          {this.props.isTokenIncluded(token.info) ? (
            <>
              <Box className={styles.amountInput}>
                <AmountInputRevamp
                  value={!amount ? null : formattedAmountToBigNumber(amount)}
                  onChange={this.onAmountUpdate.bind(this)}
                  decimalPlaces={this.getNumDecimals()}
                  amountFieldRevamp
                  placeholder={displayAmount}
                  onFocus={() => {
                    this.setState({ isInputFocused: true });
                  }}
                  onBlur={() => {
                    this.setState({ isInputFocused: false });
                    if (!amount) {
                      this.props.onRemoveToken(token.info);
                    }
                  }}
                  autoFocus
                />
              </Box>
              <Box component="button" onClick={() => this.props.onRemoveToken(token.info)} className={styles.close}>
                <IconWrapper>
                  <CloseIcon />
                </IconWrapper>
              </Box>
              <Typography variant="caption1" position="absolute" bottom="-20px" right="16px" color="ds.text_error">
                {isNotValid && intl.formatMessage(messages.notEnoughMoneyToSendError)}
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="grayscale.900" className={styles.amount} sx={{ paddingRight: '10px' }}>
              {displayAmount}
            </Typography>
          )}
        </Box>
      </div>
    );
  }
}
