// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import classnames from 'classnames';

import CustomTooltip from '../../widgets/CustomTooltip';

import styles from './TransferCards.scss';

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
  createTitle: {
    id: 'wallet.add.page.create.title',
    defaultMessage: '!!!Create wallet',
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
|};

@observer
export default class TransferCards extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      onCreate,
    } = this.props;

    return (
      <div className={styles.heroCardsList}>
        {/* Connect to hardware wallet */}
        {true &&
          <button
            type="button"
            className="WalletAdd_btnConnectHW"
            onClick={onCreate}
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
      </div>
    );
  }
}
