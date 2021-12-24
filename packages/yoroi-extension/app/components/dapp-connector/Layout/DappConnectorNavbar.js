// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './DappConnectorNavbar.scss'
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {||}

const messages = defineMessages({
  switcherLable: {
    id: 'connectedWebsites.navbar.switcher.label',
    defaultMessage: '!!!Dapp Connector is',
  },
  on: {
    id: 'connectedWebsites.navbar.switcher.on',
    defaultMessage: '!!!on',
  },
  off: {
    id: 'connectedWebsites.navbar.switcher.off',
    defaultMessage: '!!!off',
  }
});


@observer
export default class DappConnectorNavbar extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <h1 className={styles.header}>Dapp connector</h1>
        <div>
          <p>
            <span>{intl.formatMessage(messages.switcherLable)}</span>
          </p>
        </div>
      </div>
    )
  }
}