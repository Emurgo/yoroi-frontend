// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import ExternalLinkSVG from '../../../../assets/images/link-external.inline.svg';
import styles from '../common/HelpLinkBlock.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  helpLinkYoroiWithLedger: {
    id: 'wallet.connect.ledger.dialog.common.step.link.helpYoroiWithLedger',
    defaultMessage: '!!!https://emurgo.io/#/en/blog/how-to-use-ledger-nano-s-with-yoroi-cardano',
  },
  helpLinkYoroiWithLedgerText: {
    id: 'wallet.connect.ledger.dialog.common.step.link.helpYoroiWithLedger.text',
    defaultMessage: '!!!Click here to know more about how to use Yoroi with Ledger.',
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
          href={intl.formatMessage(messages.helpLinkYoroiWithLedger)}
          onClick={event => onExternalLinkClick(event)}
        >
          {intl.formatMessage(messages.helpLinkYoroiWithLedgerText)}
          <ExternalLinkSVG />
        </a>
      </div>);
  }
}
