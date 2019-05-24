// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import styles from './WalletCreateDialog.scss';
import SvgInline from 'react-svg-inline';
import arrowDown from '../../assets/images/expand-arrow.inline.svg';

const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.restore.dialog.title.label',
    defaultMessage: '!!!Restore wallet',
  },
  mnemonic: {
    id: 'wallet.create.type.mnemonic.title',
    defaultMessage: '!!!Wallet from 15 mnemonic words',
  },
  paper: {
    id: 'wallet.create.type.paper.title',
    defaultMessage: '!!!Paper Wallet',
  },
  trezor: {
    id: 'wallet.create.type.trezor.title',
    defaultMessage: '!!!Trezor Wallet',
  },
  ledger: {
    id: 'wallet.create.type.ledger.title',
    defaultMessage: '!!!Ledger  Wallet',
  },
  more: {
    id: 'settings.general.learn.more',
    defaultMessage: '!!!Learn more',
  },
});

type Props = {
  type: string,
  action: Function
};

type State = {
  showMore: boolean,
};

@observer
export default class WalletTypeItem extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    showMore: false,
  };

  toggleDesc() {
    this.setState(prevState => ({ showMore: !prevState.showMore }));
  }

  render() {
    const { intl } = this.context;
    const { action, type } = this.props;

    const showMoreClasses = classnames([
      styles.walletTypeMore,
      this.state.showMore && styles.showMore,
    ]);

    const showMoreBtnClasses = classnames([
      styles.moreBtn,
      this.state.showMore && styles.arrowUp,
    ]);

    return (
      <li className={styles.walletTypeListItem}>
        <div className={styles.walletType}>
          <button type="button" onClick={action} className={styles.walletTypeTop}>
            <div className={`${styles.walletTypeImg} ${styles[type]}`} />
            <div className={styles.walletTypeTitle}>
              {intl.formatMessage(messages[type])}
            </div>
          </button>
          <div className={showMoreClasses}>
            <p className={styles.walletTypeDesc}>
              The simplest and most common way to create a Wallet.
              Yoroi will generate 15 mnemonic words that you will have to store
              in a safe place in order to restore the wallet.
            </p>
          </div>
          <button className={showMoreBtnClasses} type="button" onClick={this.toggleDesc.bind(this)}>
            {intl.formatMessage(messages.more)}
            <SvgInline svg={arrowDown} width="15px" height="15px" className={styles.moreBtnIcon} />
          </button>
        </div>
      </li>
    );
  }

}
