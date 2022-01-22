// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './Navbar.scss'
import type { Node } from 'react';

type Props = {|
    header: string,
|}

@observer
export default class Navbar extends Component<Props> {

    render(): Node {
        return (
          <div className={styles.component}>
            <h1 className={styles.header}>{this.props.header}</h1>
          </div>
        )
    }
}