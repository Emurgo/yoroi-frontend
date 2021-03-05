// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, FormattedMessage, } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import BaseWarningDialog from './BaseWarningDialog';

const messages = defineMessages({
  explanation1: {
    id: 'wallet.debugwallet.explanation1',
    defaultMessage: '!!!The wallet you selected ({checksumTextPart}) is for testing & debugging.',
  },
});

type Props = {|
  +onClose: void => void,
  +onExternalLinkClick: MouseEvent => void,
  +checksumTextPart: string,
|};

@observer
export default class DebugWalletDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };


  render(): Node {
    const { checksumTextPart } = this.props;
    return (
      <BaseWarningDialog
        onClose={this.props.onClose}
        onExternalLinkClick={this.props.onExternalLinkClick}
        explanationHeader={
          <><FormattedMessage {...messages.explanation1} values={{ checksumTextPart }} /><br /></>
        }
      />
    );
  }
}
