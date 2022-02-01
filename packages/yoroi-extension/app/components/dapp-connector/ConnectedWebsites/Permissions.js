// @flow
import { Component } from 'react';
import type { Node } from 'react';
import styles from './Permissions.scss'
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';


const messages = defineMessages({
    heading: {
        id: 'clean',
        defaultMessage: '!!!Enable Yoroi to access dApps',
    }
})

export default class Permissions extends Component {
    static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context

        return (
          <div>
            <div>
              <h1>{intl.formatMessage(messages.heading)}</h1>
            </div>
          </div>
        )
    }
}