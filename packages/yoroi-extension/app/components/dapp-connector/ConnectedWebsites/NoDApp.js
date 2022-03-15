// @flow
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import NoItemsFoundImg from '../../../assets/images/dapp-connector/no-websites-connected.inline.svg'
import { connectorMessages } from '../../../i18n/global-messages';
import { DAPPS } from './dapps'

const messages = defineMessages({
    noWebsitesConnected: {
      id: 'connector.connect.noWebsitesConnected',
      defaultMessage: `!!!You don't have any websites connected yet`,
    },
});

@observer
export default class NoDApp extends Component {
    static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context
        console.log({DAPPS})
        return (
          <div>
            <div>
              <div>
                <NoItemsFoundImg />
                <h3>{intl.formatMessage(messages.noWebsitesConnected)} </h3>
                <p>{intl.formatMessage(connectorMessages.messageReadOnly)}</p>
              </div>
            </div>
          </div>
        )
    }
}

