// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import QuickAccessListheader from './QuickAccessListHeader';
import styles from './QuickAccessWalletsList.scss'
import QuickAccessWalletCard from './QuickAccessWalletCard';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

type Props = {|
  +wallets: Array<Object>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?number,
|}
@observer
export default class QuickAccessWalletsList extends Component<Props> {
    static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        return (
          <div className={styles.component}>
            <QuickAccessListheader />
            <div className={styles.walletsList}>
              {this.props.wallets.map(wallet => (
                <QuickAccessWalletCard
                  unitOfAccountSetting={this.props.unitOfAccountSetting}
                  getCurrentPrice={this.props.getCurrentPrice}
                  {...wallet}
                />
              ))}
            </div>
          </div>
        )
    }
}
