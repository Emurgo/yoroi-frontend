// @flow
import { Component } from 'react';
import styles from './AssetsDropdown.scss'
import DefaultAssetIcon from '../../../../assets/images/assets-page/asset-no.inline.svg'

type Props = {|
    +assetsList: Asset[],
|}

type State = {|
    +isOpen: boolean,
|}

export default class AssetsDropdown extends Component<Props, State> {

    state: State = {
        isOpen: false,
    }

    toggleDropdown(): void {
      const { isOpen } = this.state
      this.setState({ isOpen: !isOpen })
    }

    render() {
        const { assets } = this.props
        const { isOpen } = this.state
        return (
          <div className={styles.component}>
            <button type='button' onClick={() => this.toggleDropdown()} className={styles.header}>
              <p className={styles.title}>Assets</p>
              <p className={styles.count}>{assets.length}</p>
            </button>

            {isOpen &&
            <div className={styles.assetsList}>
              {
                assets.map(asset => (
                  <div className={styles.assetRow} key={asset.id}>
                    <div className={styles.left}>
                      <div className={styles.assetLogo}>
                        <DefaultAssetIcon />
                      </div>
                      <p className={styles.name}>{asset.name}</p>
                    </div>
                    <p className={styles.amount}>{asset.amount}</p>
                  </div>
                ))
                }
            </div>}
          </div>
        )
    }
}