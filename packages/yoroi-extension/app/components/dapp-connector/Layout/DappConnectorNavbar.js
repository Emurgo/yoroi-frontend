// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {||}

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
    const isDappConnectorActive = false
    return (
      <div className={styles.component}>
        <h1 className={styles.header}>Dapp connector</h1>
        <div>
          <p>
            <span>{intl.formatMessage(
              isDappConnectorActive ? messages.switcherLabelOn : messages.switcherLabelOff
              )}
            </span>
          </p>
        </div>
      </div>
    )
  }
}