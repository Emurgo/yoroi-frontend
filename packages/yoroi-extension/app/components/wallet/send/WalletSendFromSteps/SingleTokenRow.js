// @flow
import { Component } from 'react';
import styles from './SingleTokenRow.scss'
import NoAssetLogo from '../../../../assets/images/assets-page/asset-no.inline.svg';
import { truncateAddressShort } from '../../../../utils/formatters';

type Props = {|
    token: string, // @todo update the type
|}

export default class SingleTokenRow extends Component<Props> {
    render() {
        const { token } = this.props
        return (
          <div className={styles.component}>
            <div className={styles.token}>
              <div className={styles.name}>
                <div className={styles.logo}><NoAssetLogo /></div>
                <p className={styles.label}>{token.label}</p>
              </div>
              <p className={styles.id}>{truncateAddressShort(token.id, 14)}</p>
              <p className={styles.amount}>{token.amount}</p>
            </div>
          </div>
        )
    }
}