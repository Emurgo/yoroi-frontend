// @flow

import type { Node } from 'react';
import type { MultiToken, TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { Component } from 'react';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../../utils/strings';
import { ReactComponent as DeleteIcon } from '../../../assets/images/revamp/delete.inline.svg';
import { ReactComponent as NoDappImage } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import { intlShape } from 'react-intl';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import { Box, Typography, styled } from '@mui/material';
import { constructPlate } from '../../topbar/NavPlate';
import styles from './WalletRow.scss';
import { IconButton } from '@mui/material';

type Props = {|
  +url: ?string,
  +protocol: ?string,
  +shouldHideBalance: boolean,
  +onRemoveWallet: ({| url: ?string, protocol: ?string |}) => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +settingsCache: ConceptualWalletSettingsCache,
  +websiteIcon: string,
  +balance: MultiToken | null,
  +plate: WalletChecksum,
  +id: string,
|};

type State = {|
  showDeleteIcon: boolean,
|};

export default class WalletRowRevamp extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    showDeleteIcon: false,
  };

  showDeleteIcon: void => void = () => {
    this.setState({ showDeleteIcon: true });
  };

  hideDeleteIcon: void => void = () => {
    this.setState({ showDeleteIcon: false });
  };

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
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (
      <>
        {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  render(): Node {
    const { url, protocol, plate, onRemoveWallet, balance, shouldHideBalance, settingsCache, websiteIcon, id } = this.props;
    const { showDeleteIcon } = this.state;

    const [, plateIcon] = constructPlate(plate, 0, '');

    return (
      <Box
        onMouseOver={this.showDeleteIcon}
        onFocus={this.showDeleteIcon}
        onMouseLeave={this.hideDeleteIcon}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          p: '8px',
          mb: '12px',
          position: 'relative',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'common.white',
          '&:hover': {
            borderColor: 'grayscale.400',
          },
        }}
        id={id}
      >
        <Box width="100%" display="flex" alignItems="center" gap="8px">
          <Box width="40px" height="40px" overflow="hidden" borderRadius="50%">
            {plateIcon}
          </Box>
          <div>
            <Typography component="div" variant="caption1" color="grayscale.900" id="connectedWalletNameLabel">
              {settingsCache.conceptualWalletName}
            </Typography>
            <Typography component="div" variant="body2" fontWeight={500} id="connectedWalletBalanceLabel">
              {this.renderAmountDisplay({
                shouldHideBalance,
                amount: balance,
              })}
            </Typography>
          </div>
        </Box>
        <Box width="100%" display="flex" gap="16px" alignItems="center">
          <Box width="32px" height="32px" borderRadius="50%" overflow="hidden">
            {websiteIcon ? <img width="100%" src={websiteIcon} alt={url} /> : <NoDappImage />}
          </Box>
          <Typography
            component="div"
            variant="body1"
            color="grayscale.900"
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            id="dAppUrlLabel"
          >
            {url}
          </Typography>
        </Box>
        {showDeleteIcon && (
          <SIconButton position="absolute" right="16px" top="16px">
            <button onClick={() => onRemoveWallet({ url, protocol })} type="button" id="removeWalletButton">
              <DeleteIcon />
            </button>
          </SIconButton>
        )}
      </Box>
    );
  }
}

const SIconButton = styled(Box)(({ theme, active }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_normal,
    },
  },
}));
