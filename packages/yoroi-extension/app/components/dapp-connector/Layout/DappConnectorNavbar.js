// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';

type Props = {|

|}

@observer
export default class DappConnectorNavbar extends Component<Props> {

  state = {
    hasPermission: false,
  }

  componentDidMount() {
    chrome.permissions.contains({
      permissions: ['tabs', 'activeTab'],
      origins: [
        '*://*/*'
      ]
    }, (result) => {
      console.log({result})
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
        <p>{this.state.hasPermission? 'Has permission' : 'Has no permission'}</p>
        <br />
        <br />
        <button onClick={this.getPermission} type='button'>Get Permission</button>
        <br />
        <br />
        <br />
        <button onClick={this.removePermission} type='button'>Remove Permission</button>
      </div>
    )
  }
}