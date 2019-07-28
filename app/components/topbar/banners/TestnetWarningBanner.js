// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import SvgInline from 'react-svg-inline';
import globalMessages from '../../../i18n/global-messages';
import { handleExternalLinkClick } from '../../../utils/routing';
import styles from './TestnetWarningBanner.scss';
import environment from '../../../environment';
import warningSvg from '../../../assets/images/warning.inline.svg';

const messages = defineMessages({
  testnetLabel: {
    id: 'testnet.label.message',
    defaultMessage: '!!!WARNING: This is a {network} network. ADA has no monetary value here. For more information, check out the FAQ at {faqLink}',
  },
});

type Props = {|
|};

@observer
export default class TestnetWarningBanner extends Component<Props> {

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
        {environment.isMainnet() ? null : (
          <div className={styles.testnetWarning}>
            <SvgInline key="0" svg={warningSvg} className={styles.warningIcon} />
            <FormattedMessage
              {...messages.testnetLabel}
              values={{ faqLink, network: environment.NETWORK }}
              key="1"
            />
          </div>)
        }
      </div>
    );
  }
}
