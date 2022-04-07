// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import QuickAccessListheader from './QuickAccessListHeader';
import styles from './QuickAccessWalletsList.scss'

// Todo: remove quick access wallet from LS when the wallet got deleted

@observer
export default class QuickAccessWalletsList extends Component<{||}> {
    static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;
        return (
          <div className={styles.component}>
            <QuickAccessListheader />
          </div>
        )
    }
}