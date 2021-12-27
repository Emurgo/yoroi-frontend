// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classnames from 'classnames'
import type { ConnectorStatus } from '../../../api/localStorage'


type Props = {|
  +connectorStatus: ConnectorStatus,
  +toggleDappConnector: void => Promise<void>,
|}

const messages = defineMessages({
  switcherLabelOn: {
    id: 'connectedWebsites.navbar.switcher.on',
    defaultMessage: '!!!Dapp Connector is on',
  },
  switcherLabelOff: {
    id: 'connectedWebsites.navbar.switcher.off',
    defaultMessage: '!!!Dapp Connector is off',
  },
});


@observer
export default class DappConnectorNavbar extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };


  render(): Node {
    const { intl } = this.context;
    const { connectorStatus: { isActive }, toggleDappConnector } = this.props

    return (
      <div className={styles.component}>
        <h1 className={styles.header}>Dapp connector</h1>
        <div className={styles.dappSwitcher}>
          <p className={styles.label}>
            <span>{intl.formatMessage(
              isActive ? messages.switcherLabelOn : messages.switcherLabelOff
              )}
            </span>
          </p>
          <label
            htmlFor='switcher'
            className={styles.switch}
          >
            <input onChange={toggleDappConnector} type="checkbox" id='switcher' />
            <span className={classnames([
              styles.slider, isActive && styles.sliderChecked
            ])}
            />
          </label>
        </div>
      </div>
    )
  }
}