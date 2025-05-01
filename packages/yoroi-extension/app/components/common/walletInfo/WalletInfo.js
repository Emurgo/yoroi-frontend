// @flow
import type { Node } from 'react';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Typography, Tooltip, styled, Box } from '@mui/material';
import { splitAmount, truncateToken, truncateLongName, maxNameLengthBeforeTruncation } from '../../../utils/formatters';
import { ReactComponent as IconEyeOpen } from '../../../assets/images/forms/password-eye.inline.svg';
import { ReactComponent as IconEyeClosed } from '../../../assets/images/forms/password-eye-close.inline.svg';
import { hiddenAmount } from '../../../utils/strings';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import styles from './WalletInfo.scss';
import { constructPlate40 } from '../../topbar/WalletCard';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

type Props = {|
  +onUpdateHideBalance: void => Promise<void>,
  +shouldHideBalance: boolean,
  +walletAmount: null | MultiToken,
  +infoText?: string,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isRefreshing: boolean,
  +plate: null | WalletChecksum,
  +conceptualWalletName: string,
|};

@observer
export default class WalletInfo extends Component<Props> {
  static contextType = IntlContext;
  render(): Node {
    const { shouldHideBalance, onUpdateHideBalance, walletAmount, conceptualWalletName } = this.props;

    const [accountPlateId, iconComponent] = this.props.plate ? constructPlate40(this.props.plate) : [];

    return (
      <div className={styles.wrapper}>
        <div className={styles.plateAndName}>
          {iconComponent}
          <div className={styles.content}>
            <Typography className={styles.name} id="walletInfo-walletName-text" color="ds.text_gray_medium" fontWeight="500">
              {this.generateNameElem(conceptualWalletName)}
            </Typography>
            <div className={styles.type}>
              <Typography className={styles.plate} id="walletInfo-walletPlate-text" color="ds.text_gray_medium">
                {accountPlateId}
              </Typography>
            </div>
          </div>
        </div>
        <div className={styles.amountAndHideIcon}>
          <Typography className={styles.amount} color="ds.text_gray_medium" id="walletInfo-amount-text">
            {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
          </Typography>
          <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
            {shouldHideBalance ? (
              <IconWrapper>
                <IconEyeClosed />{' '}
              </IconWrapper>
            ) : (
              <IconWrapper>
                <IconEyeOpen />
              </IconWrapper>
            )}
          </button>
        </div>
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
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          {afterDecimalRewards}
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

  generateNameElem: string => Node = walletName => {
    if (walletName.length <= maxNameLengthBeforeTruncation) {
      return walletName;
    }

    const truncatedName = truncateLongName(walletName);

    return (
      <Tooltip
        title={
          <Typography component="div" variant="body3">
            {walletName}
          </Typography>
        }
      >
        <Typography component="div" variant="body-2-medium">
          {truncatedName}
        </Typography>
      </Tooltip>
    );
  };
}
