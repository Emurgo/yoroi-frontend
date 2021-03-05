// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import ExternalLinkSVG from '../../../../assets/images/link-external.inline.svg';
import styles from '../common/HelpLinkBlock.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  helpLinkYoroiWithTrezor: {
    id: 'wallet.connect.trezor.dialog.common.step.link.helpYoroiWithTrezor',
    defaultMessage: '!!!https://yoroi-wallet.com/',
  },
  helpLinkYoroiWithTrezorText: {
    id: 'wallet.connect.trezor.dialog.common.step.link.helpYoroiWithTrezor.text',
    defaultMessage: '!!!Click here to know more about how to use Yoroi with Trezor.',
  },
});

type Props = {|
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class HelpLinkBlock extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const { onExternalLinkClick } = this.props;

    return (
      <div className={styles.component}>
        <a
          href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}
          onClick={event => onExternalLinkClick(event)}
        >
          {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
          <ExternalLinkSVG />
        </a>
      </div>);
  }
}
