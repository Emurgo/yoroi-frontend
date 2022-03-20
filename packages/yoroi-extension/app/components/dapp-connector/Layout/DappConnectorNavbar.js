// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';

type Props = {||}

@observer
export default class DappConnectorNavbar extends Component<Props> {

    render(): Node {
        return (
          <div className={styles.component}>
            <h1 className={styles.header}>Dapp connector</h1>
          </div>
        )
    }
}