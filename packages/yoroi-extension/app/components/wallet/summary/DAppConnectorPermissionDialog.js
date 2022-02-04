// @flow

import { Component } from 'react';
import Dialog from '../../widgets/Dialog';
import styles from './DAppConnectorPermissionDialog.scss';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import classNames from 'classnames';

const messages = defineMessages({
    header: {
        id: 'connector.connectedWebsites.permissions.header',
        defaultMessage: '!!!Enable Yoroi to access dApps',
    },
    firstBlockHeader: {
      id: 'connector.connectedWebsites.permissions.firstBlockHeader',
      defaultMessage: '!!!Why do you need dApp connector?',
    },
    firstBlockText: {
      id: 'connector.connectedWebsites.permissions.firstBlockText',
      defaultMessage: '!!!DApp connector will allow the interaction between your Yoroi wallets and any Cardano dApps. You will be able to participate in any activities that the dApp permits such as purchasing or selling tokens, gaining access to resources, or using other features offered by the dApp.'
    },
    enable: {
      id: 'connector.connectedWebsites.permissions.enable',
      defaultMessage: '!!!enable'
    }
})

export default class DAppConnectorPermissionDialog extends Component {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render() {
        const { intl } = this.context
        return (
          <Dialog
            className={classNames([styles.component, styles.DAppConnectorPermissionDialog])}
            position={['center', 'flex-end']}
          >
            <h1>Hello</h1>
          </Dialog>
        )
    }
}