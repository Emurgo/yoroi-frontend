// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { handleExternalLinkClick } from '../../../utils/routing';
import styles from './TestnetWarningBanner.scss';
import environment from '../../../environment';

const messages = defineMessages({
  testnetLabel: {
    id: 'testnet.label.message',
    defaultMessage: '!!!WARNING: This is a testnet. ADA on the testnet has no monetary value. For more information, check out the FAQ at {faqLink}',
    description: 'Message alerting users the wallet is not running in mainnet.'
  },
});

@observer
export default class TestnetWarningBanner extends Component<{}> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    const faqLink = (
      <a
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.faqLinkUrl)}
      </a>
    );

    return (
      <div>
        {
          environment.isMainnet() ? null : (
            <div className={styles.testnetWarning}>
              <FormattedMessage {...messages.testnetLabel} values={{ faqLink }} />
            </div>
          )
        }
      </div>
    );
  }
}
