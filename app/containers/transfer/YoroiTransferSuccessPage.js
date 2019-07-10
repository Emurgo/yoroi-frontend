// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SuccessPage from '../../components/transfer/SuccessPage';

const messages = defineMessages({
  title: {
    id: 'yoroiTransfer.successPage.title',
    defaultMessage: '!!!success',
  },
  text: {
    id: 'yoroiTransfer.successPage.text',
    defaultMessage: '!!!Your funds were successfully transfered.',
  },

});

type Props = {|
  classicTheme: boolean,
|};

@observer
export default class YoroiTransferSuccessPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { classicTheme } = this.props;

    return (<SuccessPage
      title={intl.formatMessage(messages.title)}
      text={intl.formatMessage(messages.text)}
      classicTheme={classicTheme}
    />);
  }
}
