// @flow
import { Component } from 'react';
import type { Node } from 'react'
import styles from './AssetsDropdown.scss'
import DefaultAssetIcon from '../../../../assets/images/assets-page/asset-no.inline.svg'
import ArrowUpIcon from '../../../../assets/images/arrow-up.inline.svg'
import ArrowDownIcon from '../../../../assets/images/arrow-down.inline.svg'
import type { Asset } from '../../assets/AssetsList'

type Props = {|
    +assets: Asset[],
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

    render(): Node {
        const { assets } = this.props
        const { isOpen } = this.state
        return (
          <div className={styles.component}>
            <button type='button' onClick={() => this.toggleDropdown()} className={styles.header}>
              <p className={styles.title}>Assets</p>
              <div className={styles.headerRight}>
                <p className={styles.count}>{assets.length}</p>
                {
                  isOpen ? <ArrowUpIcon /> : <ArrowDownIcon />
                }
              </div>
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