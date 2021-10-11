// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './AssetsPage.scss';

import AssetsList from './AssetsList';
import type { Asset } from './AssetsList';



type Props = {|
  +assetsList: Asset[],
|};

@observer
export default class AssetsPage extends Component<Props> {

  render(): Node {
    return (
      <div className={styles.component}>
        <AssetsList assetsList={this.props.assetsList} />
      </div>
    );
  }
}