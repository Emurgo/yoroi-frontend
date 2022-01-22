// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './YoroiPalette.scss'
import type { Node } from 'react';

type Props = {|
    header: string,
|}

@observer
export default class YoroiPalettePage extends Component<Props> {

    render(): Node {
        return (
          <div className={styles.component}>
              Hi
          </div>
        )
    }
}