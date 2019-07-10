// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import ErrorPage from '../../components/transfer/ErrorPage';
import globalMessages from '../../i18n/global-messages';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.errorPage.title.label',
    defaultMessage: '!!!Unable to restore Daedalus wallet',
  },
});

type Props = {|
  error?: ?LocalizableError,
  onCancel: Function,
  classicTheme: boolean,
|};

@observer
export default class DaedalusTransferErrorPage extends Component<Props> {
  static defaultProps = {
    error: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { error, onCancel, classicTheme } = this.props;

    return (<ErrorPage
      title={intl.formatMessage(messages.title)}
      backButtonLabel={intl.formatMessage(globalMessages.backButtonLabel)}
      onCancel={onCancel}
      error={error}
      classicTheme={classicTheme}
    />);
  }
}
