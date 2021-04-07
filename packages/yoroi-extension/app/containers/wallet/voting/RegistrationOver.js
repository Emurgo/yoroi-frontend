// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import FullscreenMessage from '../../../components/wallet/layouts/FullscreenMessage';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

export const messages: * = defineMessages({
  title: {
    id: 'wallet.registrationOver.title',
    defaultMessage: '!!!Registration has ended',
  },
  subtitle: {
    id: 'wallet.registrationOver.subtitle',
    defaultMessage: '!!!Registration for fund {roundNumber} is over. Open the Catalyst app for more information',
  },
});

type Props = {|
  roundNumber: number,
|};

@observer
export default class RegistrationOver extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <FullscreenMessage
        title={intl.formatMessage(messages.title)}
        subtitle={intl.formatMessage(
          messages.subtitle,
          {
            roundNumber: this.props.roundNumber,
          }
        )}
      />
    );
  }
}
