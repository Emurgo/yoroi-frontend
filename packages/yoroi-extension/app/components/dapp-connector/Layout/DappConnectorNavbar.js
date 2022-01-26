// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';
import classnames from 'classnames';

type Props = {|

|}

@observer
export default class DappConnectorNavbar extends Component<Props> {

  state = {
    hasPermission: false,
  }

  componentDidMount() {
    this.checkAccess()
  }

  checkAccess() {
    chrome.permissions.contains({
      permissions: ['tabs', 'activeTab'],
      origins: [
        '*://*/*'
      ]
    }, (result) => {
      this.setState({ hasPermission: result })
    });
  }

  getPermission() {
    chrome.permissions.request({
      permissions: ['tabs', 'activeTab'],
      origins: [
        '*://*/*'
      ]
    }, (granted) => {
      this.setState({ hasPermission: granted })
      if (granted) {
        alert('you have the permissions')
      } else {
        alert('You don\'t')
      }
    });
  }

  removePermission() {
    chrome.permissions.remove({
      permissions: ['tabs', 'activeTab'],
      origins: [
        '*://*/*'
      ]
    }, (removed) => {
      this.setState({ hasPermission: !removed })
      if (removed) {
        alert('permissions removed')
      } else {
        alert('permissions is not removed!')
      }
    });
  }

  render(): Node {

    return (
      <div className={styles.component}>
        <h1 className={styles.header}>Dapp connector</h1>
        <div className={styles.permissionsContainer}>
          <p className={styles.hasPermission}>{this.state.hasPermission? 'Has permission' : 'Has no permission'}</p>
          <button className={classnames([styles.permission, styles.getPermission])} onClick={this.getPermission.bind(this)} type='button'>Get Permission</button>
          <button className={classnames([styles.permission, styles.removePermission])} onClick={this.removePermission.bind(this)} type='button'>Remove Permission</button>
        </div>
      </div>
    )
  }
}