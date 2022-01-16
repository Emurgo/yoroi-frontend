// @flow

import { Component } from 'react'
import type { Node } from 'react';
import styles from './WalletRow.scss'
import WalletAccountIcon from '../../topbar/WalletAccountIcon';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { PublicDeriverCache } from '../../../../chrome/extension/ergo-connector/types';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import { hiddenAmount } from '../../../utils/strings';
import DeleteIcon from '../../../assets/images/dapp-connector/delete.inline.svg';
import NoDappImage from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import WalletType from '../../widgets/WalletType';
import NavPlate from '../../topbar/NavPlate'
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  active: {
    id: 'connector.connect.connectedWallets.active',
    defaultMessage: '!!!Active',
  }
});

type Props = {|
    +url: ?string,
    +protocol: ?string,
    +isActiveSite: boolean,
    +shouldHideBalance: boolean,
    +onRemoveWallet: {| url: ?string, protocol: ?string |} => void,
    +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
    +settingsCache: ConceptualWalletSettingsCache | null,
    +websiteIcon: string,
|};

type State = {|
  showDeleteIcon: boolean,
|}


export default class WalletRow extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    showDeleteIcon: false,
  }

  showDeleteIcon: void => void = () => {
    this.setState({ showDeleteIcon: true })
  }

  hideDeleteIcon: void => void = () => {
    this.setState({ showDeleteIcon: false })
  }

  render(): Node {
      const {
      isActiveSite,
      url,
      protocol,
      plate,
      onRemoveWallet,
      balance,
      shouldHideBalance,
      getTokenInfo,
      settingsCache,
      websiteIcon
      } = this.props;
      const { showDeleteIcon } = this.state
      const { intl } = this.context;
      const defaultEntry = balance.getDefaultEntry();
      const tokenInfo = getTokenInfo(defaultEntry);
      const shiftedAmount = defaultEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

      return (
        <div>
          <div
            onMouseEnter={this.showDeleteIcon}
            onMouseLeave={this.hideDeleteIcon}
            className={styles.component}
          >
            <p className={styles.name}>
              {settingsCache.conceptualWalletName}
              {settingsCache && <span> &#183; <WalletType wallet={settingsCache} /></span>}
            </p>
            <div className={styles.rowWrapper}>
              <div>
                <div className={styles.card}>
                  <div className={styles.avatar}>
                    <NavPlate plate={plate} wallet={settingsCache} />
                  </div>
                  <p className={styles.balance}>
                    {shouldHideBalance ? hiddenAmount : shiftedAmount.toString()}{' '}
                    <span>{getTokenName(tokenInfo)}</span>
                  </p>
                </div>
              </div>
              <div className={styles.dapp}>
                <div className={styles.websiteIcon}>
                  {websiteIcon ?
                    <img src={websiteIcon} alt={url} />:
                    <NoDappImage />
                  }
                </div>
                <div>
                  <p className={styles.url}>{url}</p>
                  {isActiveSite &&
                    <p className={styles.status}>
                      {intl.formatMessage(messages.active)}
                    </p>}
                </div>
              </div>
              <div className={styles.delete}>
                {showDeleteIcon &&
                <button onClick={() => onRemoveWallet({ url, protocol })} type='button'>
                  <DeleteIcon />
                </button>}
              </div>
            </div>
          </div>
        </div>
      )
  }
}