// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';

import CustomTooltip from '../../widgets/CustomTooltip';

import styles from './MainCards.scss';

import environment from '../../../environment';

const messages = defineMessages({
  connectToHWTitle: {
    id: 'wallet.add.page.hw.title',
    defaultMessage: '!!!Connect to hardware wallet',
  },
  connectToHWTooltip: {
    id: 'wallet.add.page.hw.tooltip',
    defaultMessage: '!!!Create or restore a Yoroi wallet<br/>using a Ledger or Trezor hardware wallet.',
  },
  createTooltip: {
    id: 'wallet.add.page.create.tooltip',
    defaultMessage: '!!!Generate a new 15-word recovery phrase<br/>and create a Yoroi wallet.',
  },
  restoreTitle: {
    id: 'wallet.add.page.restore.title',
    defaultMessage: '!!!Restore wallet',
  },
  restoreTooltip: {
    id: 'wallet.add.page.restore.tooltip',
    defaultMessage: '!!!Enter a 15-word recovery phrase<br/>to restore an already-existing Yoroi wallet,<br/>or import an existing Yoroi paper wallet.',
  },

});

type Props = {|
  +onCreate: void => void,
  +onRestore: void => void,
  +onHardwareConnect: void => void,
|};

@observer
export default class MainCards extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      onCreate,
      onRestore,
      onHardwareConnect,
    } = this.props;

    return (
      <div className={styles.heroCardsList}>
        {/* Connect to hardware wallet */}
        {!environment.isJormungandr() &&
          <button
            type="button"
            className="WalletAdd_btnConnectHW"
            onClick={onHardwareConnect}
          >
            <div className={styles.heroCardsItem}>
              <div className={classnames([styles.heroCardsItemBg, styles.bgConnectHW])} />
              <div className={styles.heroCardsItemTitle}>
                {intl.formatMessage(messages.connectToHWTitle)}
                <div className={styles.tooltip}>
                  <CustomTooltip
                    toolTip={
                      <div><FormattedHTMLMessage {...messages.connectToHWTooltip} /></div>
                    }
                  />
                </div>
              </div>
            </div>
          </button>
        }
        {/* Create wallet */}
        <button
          type="button"
          className="WalletAdd_btnCreateWallet"
          onClick={onCreate}
        >
          <div className={styles.heroCardsItem}>
            <div className={classnames([styles.heroCardsItemBg, styles.bgCreateWallet])} />
            <div className={styles.heroCardsItemTitle}>
              {intl.formatMessage(globalMessages.createWalletLabel)}
              <div className={styles.tooltip}>
                <CustomTooltip
                  toolTip={
                    <div><FormattedHTMLMessage {...messages.createTooltip} /></div>
                  }
                />
              </div>
            </div>
          </div>
        </button>
        {/* Restore wallet */}
        <button
          type="button"
          className="WalletAdd_btnRestoreWallet"
          onClick={onRestore}
        >
          <div className={styles.heroCardsItem}>
            <div
              className={classnames([styles.heroCardsItemBg, styles.bgRestoreWallet])}
            />
            <div className={styles.heroCardsItemTitle}>
              {intl.formatMessage(messages.restoreTitle)}
              <div className={styles.tooltip}>
                <CustomTooltip
                  toolTip={
                    <div><FormattedHTMLMessage {...messages.restoreTooltip} /></div>
                  }
                />
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  }
}
