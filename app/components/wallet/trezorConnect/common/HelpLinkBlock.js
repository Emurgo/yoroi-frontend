// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';

import externalLinkSVG from '../../../../assets/images/link-external.inline.svg';
import type { ProgressInfo } from '../../../../stores/ada/TrezorConnectStore';
import styles from './HelpLinkBlock.scss';

const messages = defineMessages({
  helpLinkYoroiWithTrezor: {
    id: 'wallet.trezor.dialog.common.step.link.helpYoroiWithTrezor',
    defaultMessage: '!!!https://yoroi-wallet.com/',
    description: 'Tutorial link about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },
  helpLinkYoroiWithTrezorText: {
    id: 'wallet.trezor.dialog.common.step.link.helpYoroiWithTrezor.text',
    defaultMessage: '!!!Click here to know more about how to use Yoroi with Trezor.',
    description: 'Tutorial link text about how to use Yoroi with Trezor on the Connect to Trezor Hardware Wallet dialog.'
  },
});

type Props = {
  progressInfo: ProgressInfo,
};

@observer
export default class HelpLinkBlock extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.linkBlock}>
        <a target="_blank" rel="noopener noreferrer" href={intl.formatMessage(messages.helpLinkYoroiWithTrezor)}>
          {intl.formatMessage(messages.helpLinkYoroiWithTrezorText)}
          <SvgInline svg={externalLinkSVG} />
        </a>
      </div>);
  }
}
