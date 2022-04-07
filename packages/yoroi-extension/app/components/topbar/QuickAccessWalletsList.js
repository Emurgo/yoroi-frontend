// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './NoWalletsAccessList.scss';
import StarIcon from '../../assets/images/add-wallet/wallet-list/stared.inline.svg';
import QuickAccessListheader from './QuickAccessListHeader';


// Todo: remove quick access wallet from LS when the wallet got deleted

export default class QuickAccessWalletsList extends Component<{||}> {
    static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context;
        return (
          <div>
            <QuickAccessListheader />
          </div>
        )
    }
}