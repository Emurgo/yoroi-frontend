// @flow

import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';
import { Typography } from '@mui/material';

type Props = {|
  minAda: string,
|};

export const messages: Object = defineMessages({
  minAda: {
    id: 'wallet.send.form.dialog.minAda',
    defaultMessage: '!!!Min-ADA: {minAda}',
  },
});

@observer
export default class MinAda extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { minAda } = this.props;

    return (
      <Typography component="div" color="grayscale.900" variant="body1">
        {intl.formatMessage(messages.minAda, { minAda })}
      </Typography>
    );
  }
}
