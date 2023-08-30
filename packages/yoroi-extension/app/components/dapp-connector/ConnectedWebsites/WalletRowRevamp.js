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
import { intlShape, defineMessages } from 'react-intl';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import { Box, Tooltip, Typography } from '@mui/material';
import styles from './WalletRow.scss';
import WalletType from '../../widgets/WalletType';
import NavPlate, { constructPlate } from '../../topbar/NavPlate';

const messages = defineMessages({
  active: {
    id: 'connector.connect.connectedWallets.active',
    defaultMessage: '!!!Active',
  },
});

type Props = {|
  +url: ?string,
  +protocol: ?string,
  +isActiveSite: boolean,
  +shouldHideBalance: boolean,
  +onRemoveWallet: ({| url: ?string, protocol: ?string |}) => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +settingsCache: ConceptualWalletSettingsCache,
  +websiteIcon: string,
  +balance: MultiToken | null,
  +plate: WalletChecksum,
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
      </>
    );
  };

  render(): Node {
    const {
      isActiveSite,
      url,
      protocol,
      plate,
      onRemoveWallet,
      balance,
      shouldHideBalance,
      settingsCache,
      websiteIcon,
    } = this.props;
    const { showDeleteIcon } = this.state;
    const { intl } = this.context;

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
      >
        <Box width="100%" display="flex" alignItems="center" gap="8px">
          <Box width="40px" height="40px" overflow="hidden" borderRadius="50%">
            {plateIcon}
          </Box>
          <div>
            <Typography variant="caption1" color="grayscale.900">
              {settingsCache.conceptualWalletName}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
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
            variant="body1"
            color="grayscale.900"
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {url}
          </Typography>
          {isActiveSite && <p className={styles.status}>{intl.formatMessage(messages.active)}</p>}
        </Box>
        {showDeleteIcon && (
          <Box position="absolute" right="16px" top="16px">
            <button onClick={() => onRemoveWallet({ url, protocol })} type="button">
              <DeleteIcon />
            </button>
          </Box>
        )}
      </Box>
    );
  }
}
