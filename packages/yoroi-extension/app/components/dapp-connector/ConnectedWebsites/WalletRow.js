// @flow

import { Component } from 'react';
import type { Node } from 'react';
import styles from './WalletRow.scss';
import type { MultiToken, TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../../utils/strings';
import { ReactComponent as DeleteIcon } from '../../../assets/images/dapp-connector/delete.inline.svg';
import { ReactComponent as NoDappImage } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import WalletType from '../../widgets/WalletType';
import NavPlate from '../../topbar/NavPlate';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import { Tooltip, Typography } from '@mui/material';

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

export default class WalletRow extends Component<Props, State> {
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

    return (
      <div>
        <div
          onMouseOver={this.showDeleteIcon}
          onFocus={this.showDeleteIcon}
          onMouseLeave={this.hideDeleteIcon}
          className={styles.component}
        >
          <div className={styles.name}>
            {settingsCache.conceptualWalletName}
            {settingsCache && (
              <span>
                {' '}
                &#183; <WalletType wallet={settingsCache} />
              </span>
            )}
          </div>
          <div className={styles.rowWrapper}>
            <div>
              <div className={styles.card}>
                <div className={styles.avatar}>
                  <NavPlate plate={plate} wallet={settingsCache} />
                </div>
                <div className={styles.balance}>
                  {this.renderAmountDisplay({
                    shouldHideBalance,
                    amount: balance,
                  })}
                </div>
              </div>
            </div>
            <div className={styles.dapp}>
              <div className={styles.websiteIcon}>
                {websiteIcon ? <img src={websiteIcon} alt={url} /> : <NoDappImage />}
              </div>
              <div id="WalletRow_url">
                <Tooltip
                  followCursor
                  placement="top"
                  title={<Typography component="div" variant="body3">{url}</Typography>}
                >
                  <Typography component="div"
                    variant="body1"
                    sx={{
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '190px',
                    }}
                  >
                    {url}
                  </Typography>
                </Tooltip>
                {isActiveSite && (
                  <div className={styles.status}>{intl.formatMessage(messages.active)}</div>
                )}
              </div>
            </div>
            <div className={styles.delete}>
              {showDeleteIcon && (
                <button onClick={() => onRemoveWallet({ url, protocol })} type="button">
                  <DeleteIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
