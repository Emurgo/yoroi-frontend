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

    render() {
        const { assets } = this.props
        return (
          <div className={styles.component}>
            <div className={styles.header}>
              <p>Assets</p>
              <p>{assets.length}</p>
            </div>

            <div>
              {
                    assets.map(asset => (
                      <div>
                        <DefaultAssetIcon />
                      </div>
                    ))
                }
            </div>
          </div>
        )
    }
}