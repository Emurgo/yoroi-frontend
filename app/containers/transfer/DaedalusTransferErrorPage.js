// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import LocalizableError from '../../i18n/LocalizableError';
import ErrorPage from '../../components/transfer/ErrorPage';

const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.errorPage.title.label',
    defaultMessage: '!!!Unable to restore Daedalus wallet',
    description: 'Label "Unable to restore Daedalus wallet" on the Daedalus transfer error page.'
  },
  backButtonLabel: {
    id: 'daedalusTransfer.errorPage.backButton.label',
    defaultMessage: '!!!Back',
    description: 'Label "Back" on the Daedalus transfer error page.'
  },
});

type Props = {
  error?: ?LocalizableError,
  onCancel: Function
};

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
    const { error, onCancel } = this.props;

    return (<ErrorPage
      title={intl.formatMessage(messages.title)}
      backButtonLabel={intl.formatMessage(messages.backButtonLabel)}
      onCancel={onCancel}
      error={error}
    />);
  }
}
