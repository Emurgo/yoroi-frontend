// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import PublicDeriverWithCachedMeta from '../../../domain/PublicDeriverWithCachedMeta';

import styles from './WalletRow.scss';

import ToggleIcon from '../../../assets/images/my-wallets/arrow_down.inline.svg';
import ConceptualIcon from '../../../assets/images/my-wallets/conceptual_wallet.inline.svg';
import PaperIcon from '../../../assets/images/my-wallets/paper_wallet.inline.svg';
import TrezorIcon from '../../../assets/images/my-wallets/trezor_wallet.inline.svg';
import SymbolADA from '../../../assets/images/my-wallets/symbol_ada.inline.svg';
import PlusIcon from '../../../assets/images/my-wallets/icon_plus.inline.svg';

import WalletName from './WalletName';
import WalletPlate from './WalletPlate';

type Props = {|
    +walletType: 'conceptual' | 'paper' | 'trezor',
    +walletSumDetails: Node,
    +walletDetails: Node,
    +walletTypeName: string,
    +publicDeriver: null | PublicDeriverWithCachedMeta,
|};

type State = {
  isExpanded: boolean,
};


@observer
export default class WalletRow extends Component<Props, State> {

  state = {
    isExpanded: false,
  };

  toggleExpansion() {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  }

  render() {
    const { isExpanded } = this.state;

    const {
      publicDeriver,
      walletType,
      walletTypeName,
      walletSumDetails,
      walletDetails
    } = this.props;

    const walletName = publicDeriver ? publicDeriver.conceptualWalletName : '';

    const currencySection = (
      <div>
        <SymbolADA />
      </div>
    );

    let Icon;

    switch (walletType) {
      case 'conceptual':
        Icon = ConceptualIcon;
        break;
      case 'paper':
        Icon = PaperIcon;
        break;
      case 'trezor':
        Icon = TrezorIcon;
        break;
      default:
        Icon = '';
        break;
    }

    return (
      <div
        className={classnames([styles.wrapper, isExpanded && styles.wrapperExpanded])}
      >
        <div className={styles.content}>
          <div className={styles.nameSection}>
            <WalletName name={walletTypeName} icon={<Icon />} />
          </div>
          <div className={styles.detailsSection}>
            {walletSumDetails}
          </div>
          <div className={styles.currencySection}>
            {currencySection}
            <button
              type="button"
              className={styles.add}
            >
              <PlusIcon />
            </button>
          </div>
          <button
            type="button"
            className={classnames([styles.toggle, isExpanded && styles.toggleExpanded])}
            onClick={this.toggleExpansion.bind(this)}
          >
            <ToggleIcon />
          </button>
        </div>
        {isExpanded ? (
          <div className={styles.expandContent}>
            <div className={styles.contentHead}>
              <div className={styles.plateSection}>
                <p className={styles.walletNumber}>1</p>
                <WalletPlate walletName={walletName} publicDeriver={publicDeriver} />
              </div>
              <div className={styles.detailsSection}>
                {walletDetails}
              </div>
              <div className={styles.expandedCurrencySection}>
                {currencySection}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
