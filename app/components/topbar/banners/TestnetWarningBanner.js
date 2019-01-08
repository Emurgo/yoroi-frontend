// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { handleExternalLinkClick } from '../../../utils/routing';
import styles from './TestnetWarningBanner.scss';
import environment from '../../../environment';

export const messages = defineMessages({
  testnetLabel: {
    id: 'testnet.label.message',
    defaultMessage: '!!!Warning: This is a testnet. ADA on the testnet has no monetary value. For more information, check out the FAQ at {faqLink}',
    description: 'Message alerting users the wallet is not running in mainnet.'
  },
  testnetLabelWarning: {
    id: 'testnet.labelWarning.message',
    defaultMessage: '!!!Warning:',
    description: 'Message alerting users the wallet is not running in mainnet.'
  },
  testnetLabelMain: {
    id: 'testnet.labelMain.message',
    defaultMessage: '!!!This is a testnet. ADA on the testnet has no monetary value. For more information, {faqLink}',
    description: 'Message alerting users the wallet is not running in mainnet.'
  },
  testnetLabelLink: {
    id: 'testnet.labelLink.message',
    defaultMessage: '!!!Check out the FAQ',
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
    const { oldTheme } = this.props;

    const testnetClasses = oldTheme ? styles.testnetWarningOld : styles.testnetWarning;

    const faqLink = oldTheme ? (
      <a
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.faqLinkUrl)}
      </a>
    ) : (
      <a
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
      >
        {intl.formatMessage(messages.testnetLabelLink)}
      </a>
    );

    return (
      <div>
        {
          environment.isMainnet() ? null : (
            <div className={testnetClasses}>
              {oldTheme ? (
                <FormattedMessage {...messages.testnetLabel} values={{ faqLink }} />
              ) : ([
                <span key="1">
                  {intl.formatMessage(messages.testnetLabelWarning)}
                  &nbsp;
                </span>,
                <FormattedMessage {...messages.testnetLabelMain} values={{ faqLink }} key="2" />
              ])}
            </div>
          )
        }
      </div>
    );
  }
}
