// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import ErrorPage from '../../components/transfer/ErrorPage';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'yoroiTransfer.errorPage.title.label',
    defaultMessage: '!!!Unable to transfer from another wallet',
  },
});

type Props = {|
  +error?: ?LocalizableError,
  +onCancel: void => void,
  +classicTheme: boolean,
|};

@observer
export default class YoroiTransferErrorPage extends Component<Props> {
  static defaultProps: {|error: void|} = {
    error: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const { error, onCancel, classicTheme } = this.props;

    return (<ErrorPage
      title={intl.formatMessage(messages.title)}
      backButtonLabel={intl.formatMessage(globalMessages.cancel)}
      onCancel={onCancel}
      error={error}
      classicTheme={classicTheme}
    />);
  }
}
