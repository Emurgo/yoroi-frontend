// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';

import externalLinkSVG from '../../../../assets/images/link-external.inline.svg';
import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';
import styles from '../common/HelpLinkBlock.scss';

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
|};

@observer
export default class HelpLinkBlock extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <a target="_blank" rel="noopener noreferrer" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
          {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
          <SvgInline svg={externalLinkSVG} />
        </a>
      </div>);
  }
}
