// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';

type Props = {|

|}

@observer
export default class DappConnectorNavbar extends Component<Props> {

  getPermission() {
    chrome.permissions.request({
      permissions: ['tabs', 'activeTab'],
      // origins: [
      //   'http://*/*',
      //   'https://*/*',
      // ]
    }, (granted) => {
      if (granted) {
        alert('you have the permissions')
      } else {
        alert('You don\'t')
      }
    });
  }

  render(): Node {

    
    return (
      <div className={styles.component}>
        <h1 className={styles.header}>Dapp connector</h1>
        <button onClick={this.getPermission} type='button'>Get Permission</button>
      </div>
    )
  }
}