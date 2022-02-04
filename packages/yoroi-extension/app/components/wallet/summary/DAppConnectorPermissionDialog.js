// @flow

import { Component } from 'react';
import Dialog from '../../widgets/Dialog';
import styles from './DAppConnectorPermissionDialog.scss';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import DAppConnectorIcon from '../../../assets/images/dapp-connector/dapp-connector-default.inline.svg'
import classNames from 'classnames';
import globalMessages from '../../../i18n/global-messages';
import { Button } from '@mui/material';

const messages = defineMessages({
    header: {
        id: 'connector.connectedWebsites.permissions.header',
        defaultMessage: '!!!Enable Yoroi to access dApps',
    },
    text: {
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
            className={classNames([styles.DAppConnectorPermissionDialog])}
            position={['center', 'flex-end']}
          >
            <div className={styles.component}>
              <div className={styles.centered}>
                <div className={styles.icon}>
                  <DAppConnectorIcon />
                </div>
                <div className={styles.content}>
                  <h3>{intl.formatMessage(messages.header)}</h3>
                  <p>{intl.formatMessage(messages.text)}</p>
                </div>

                <div className={styles.actions}>
                  <Button variant="secondary">{intl.formatMessage(globalMessages.cancel)}</Button>
                  <Button variant="primary">{intl.formatMessage(messages.enable)}</Button>
                </div>
              </div>
            </div>
          </Dialog>
        )
    }
}