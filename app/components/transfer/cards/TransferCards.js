// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';
import globalMessages from '../../../i18n/global-messages';

import CustomTooltip from '../../widgets/CustomTooltip';

import styles from './TransferCards.scss';

const messages = defineMessages({
  byronWallet: {
    id: 'wallet.transfer.cards.byron',
    defaultMessage: '!!!Byron-era wallet',
  },
});

type Props = {|
  +onByron: void => void,
|};

@observer
export default class TransferCards extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.heroCardsList}>
        {/* byron-era wallet */}
        <button
          type="button"
          className="TransferCards_byronEra"
          onClick={this.props.onByron}
        >
          <div className={styles.heroCardsItem}>
            <div className={classnames([styles.heroCardsItemBg, styles.bgCreateWallet])} />
            <div className={styles.heroCardsItemTitle}>
              {intl.formatMessage(messages.byronWallet)}
              <div className={styles.tooltip}>
                <CustomTooltip
                  toolTip={
                    <div><FormattedHTMLMessage {...globalMessages.legacyAttentionText} /></div>
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
