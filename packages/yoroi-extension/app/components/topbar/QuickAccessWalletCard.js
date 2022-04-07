// @flow
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import QuickAccessListheader from './QuickAccessListHeader';
import styles from './QuickAccessWalletCard.scss'
import { getType, getEra, getIcon } from '../../utils/walletInfo';
import { constructPlate } from './WalletCard';

export default class QuickAccessWalletCard extends Component<{||}> {
    render(): Node {
        const { intl } = this.context;
        // const { shouldHideBalance } = this.props.wallet;
        // const [, iconComponent] = this.props.wallet.plate
        //   ? constructPlate(this.props.plate, 0, styles.icon)
        //   : [];

        // const typeText = [getType(this.props.wallet.conceptualWallet)]
        //   .filter(text => text != null)
        //   .map(text => intl.formatMessage(text))
        //   .join(' - ');
        // const totalAmount = this.getTotalAmount();

        return (
          <div className={styles.component}>
            I am a card
          </div>
        )
    }
}