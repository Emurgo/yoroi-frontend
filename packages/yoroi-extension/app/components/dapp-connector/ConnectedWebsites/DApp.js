// @flow
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import NoItemsFoundImg from '../../../assets/images/dapp-connector/no-websites-connected.inline.svg'
import { connectorMessages } from '../../../i18n/global-messages';
import { Button, Stack, styled, Typography } from '@mui/material';

@observer
export default class DApp extends Component {
    static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
        intl: intlShape.isRequired,
    };

    render(): Node {
        const { intl } = this.context
        const { dapp } = this.props
        return (
          <div>
            <div>
              {dapp.logo}
            </div>
            <div>
              <p>{intl.formatMessage(dapp.name)}</p>
              <p>{intl.formatMessage(dapp.description)}</p>
            </div>

            <Button>{intl.formatMessage(connectorMessages.connect)}</Button>
          </div>
        )
    }
}

