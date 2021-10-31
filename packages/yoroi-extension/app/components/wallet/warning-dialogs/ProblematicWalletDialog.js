// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, FormattedMessage, } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import BaseWarningDialog from './BaseWarningDialog';

const messages = defineMessages({
  explanation1: {
    id: 'wallet.problematic.explanation1',
    defaultMessage: '!!!The wallet you selected ({checksumTextPart}) was detected to contain some kind of issue.',
  },
});

type Props = {|
  +onClose: void => void,
  +onExternalLinkClick: MouseEvent => void,
  +checksumTextPart: string,
|};

@observer
export default class ProblematicWalletDialog extends Component<Props> {
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
