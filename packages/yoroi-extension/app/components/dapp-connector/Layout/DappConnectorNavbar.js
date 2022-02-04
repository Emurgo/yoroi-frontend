// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';


type Props = {||}
type State = {|
  hasPermission: boolean,
|}

/*::
declare var chrome;
*/
@observer
export default class DappConnectorNavbar extends Component<Props, State> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
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
    });
  }

  render(): Node {
    const { intl } = this.context
    return (
      <div className={styles.component}>
        <h1 className={styles.header}>{intl.formatMessage(connectorMessages.dappConnector)}</h1>
        <div className={styles.permissionsContainer}>
          <p className={styles.hasPermission}>{this.state.hasPermission? 'Has permission' : 'Has no permission'}</p>
          <button className={classnames([styles.permission, styles.getPermission])} onClick={this.getPermission.bind(this)} type='button'>Get Permission</button>
          <button className={classnames([styles.permission, styles.removePermission])} onClick={this.removePermission.bind(this)} type='button'>Remove Permission</button>
        </div>
      </div>
    )
  }
}