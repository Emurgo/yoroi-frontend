// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import CustomTooltip from '../../widgets/CustomTooltip';

import styles from './TransferCards.scss';

const messages = defineMessages({
  byronWallet: {
    id: 'wallet.transfer.cards.byron',
    defaultMessage: '!!!Byron-era wallet',
  },
  shelleyEraWallet: {
    id: 'wallet.transfer.cards.shelley',
    defaultMessage: '!!!Shelley-era wallet',
  },
});

type Props = {|
  +onByron: void => void,
  +onShelley: void => void,
|};

@observer
export default class TransferCards extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <div className={styles.heroCardsList}>
        {/* byron-era wallet */}
        <button
          type="button"
          className="TransferCards_byronEra"
          onClick={this.props.onByron}
        >
          <div
            className={classnames([
              styles.heroCardsItem,
              styles.heroCardsItemBg,
              styles.bgByronMainnet,
            ])}
          >
            <div className={styles.heroCardsItemTitle}>
              {intl.formatMessage(messages.byronWallet)}
              <div className={styles.tooltip}>
                <CustomTooltip
                  toolTip={
                    <div className={styles.tooltipSize}>
                      {intl.formatMessage(globalMessages.restoreByronEraWalletDescription)}
                    </div>
                  }
                />
              </div>
            </div>
            <div className={styles.heroCardsItemDate}>
              2017-2020
            </div>
          </div>
        </button>
        {/* shelley-itn wallet */}
        <button
          type="button"
          className="TransferCards_shelleyEra"
          onClick={this.props.onShelley}
        >
          <div
            className={classnames([
              styles.heroCardsItem,
              styles.heroCardsItemBg,
              styles.bgShelleyMainnet,
            ])}
          >
            <div className={styles.heroCardsItemTitle}>
              {intl.formatMessage(messages.shelleyEraWallet)}
              <div className={styles.tooltip}>
                <CustomTooltip
                  toolTip={
                    <div className={styles.tooltipSize}>
                      {intl.formatMessage(globalMessages.restoreShelleyEraWalletDescription)}
                    </div>
                  }
                />
              </div>
            </div>
            <div className={styles.heroCardsItemDate}>
              2020
            </div>
          </div>
        </button>
      </div>
    );
  }
}
