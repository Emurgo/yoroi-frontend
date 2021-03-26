// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './DropdownCard.scss';
import ExpandArrow from '../../assets/images/arrow-expand.inline.svg';
import DeleteIcon from '../../assets/images/remove-icon.inline.svg';
import classnames from 'classnames';
import WalletCard from '../connect/WalletCard';
import { observer } from 'mobx-react';
import type { PublicDeriverCache } from '../../../../chrome/extension/ergo-connector/types';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';

type Props = {|
  +label: string,
  +infoText: string,
  +url: ?string,
  +isActiveSite: boolean,
  +wallet: PublicDeriverCache,
  +shouldHideBalance: boolean,
  +onRemoveWallet: ?string => void,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
|};
type State = {| isExpanded: boolean |};
@observer
export default class DropdownCard extends Component<Props, State> {
  state: State = {
    isExpanded: false,
  };

  toggleDropdown: () => void = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  };

  render(): Node {
    const {
      label,
      infoText,
      isActiveSite,
      url,
      wallet,
      onRemoveWallet,
      shouldHideBalance,
    } = this.props;

    const { isExpanded } = this.state;
    const arrowClasses = isExpanded ? styles.collapseArrow : styles.expandArrow;

    const statusIcon = classnames([styles.status, isActiveSite ? styles.active : '']);
    const headerStyles = classnames([styles.header, isExpanded ? styles.expandedHeader : '']);

    return (
      <div>
        <div className={headerStyles} onClick={this.toggleDropdown} role="presentation" aria-hidden>
          <div className={styles.headerTitle}>
            <div className={statusIcon} />
            <p>{url}</p>
          </div>
          <div className={styles.expandArrowBox}>
            <span className={arrowClasses}>
              <ExpandArrow />
            </span>
          </div>
        </div>
        {isExpanded ? (
          <div className={styles.expandedContent}>
            <h3>{label}</h3>
            <p>{infoText}</p>
            <div className={styles.card}>
              <div
                className={styles.remove}
                onClick={() => onRemoveWallet(url)}
                role="presentation"
                aria-hidden
              >
                <span className={styles.removeIcon}>
                  <DeleteIcon />
                </span>
              </div>
              <WalletCard
                shouldHideBalance={shouldHideBalance}
                publicDeriver={wallet}
                getTokenInfo={this.props.getTokenInfo}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
