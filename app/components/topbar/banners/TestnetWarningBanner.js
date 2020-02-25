// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { handleExternalLinkClick } from '../../../utils/routing';
import styles from './TestnetWarningBanner.scss';
import environment from '../../../environment';
import WarningSvg from '../../../assets/images/warning.inline.svg';
import ShelleyTestnetWarningSvg from '../../../assets/images/shelley-testnet-warning.inline.svg';

const messages = defineMessages({
  testnetLabel: {
    id: 'testnet.label.message',
    defaultMessage: '!!!WARNING: This is a {network} network. ADA has no monetary value here. For more information, check out the FAQ at {faqLink}',
  },
  shelleyTestnetLabel: {
    id: 'testnet.shelley.label.message',
    defaultMessage: 'YOU ARE ON TESTNET NETWORK ({network}).',
  },
  nightlyLabel: {
    id: 'nightly.banner.label.message',
    defaultMessage: 'YOU ARE ON YOROI NIGHTLY ({network}).',
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
    if (environment.isProduction() && !environment.isShelley() && !environment.isNightly()) {
      // banner will not shown in Mainnet non-nightly builds
      return null;
    }

    const { intl } = this.context;

    const faqLink = (
      <a
        href={intl.formatMessage(globalMessages.faqLinkUrl)}
        onClick={event => handleExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.faqLinkUrl)}
      </a>
    );

    if (environment.isNightly()) {
      return (
        <div className={styles.shelleyTestnetWarning}>
          <span key="0" className={styles.shelleyTestnetWarningIcon}><ShelleyTestnetWarningSvg /></span>
          <div className={styles.text}>
            <FormattedMessage
              {...messages.nightlyLabel}
              values={{ network: environment.NETWORK }}
              key="1"
            />
          </div>
        </div>
      );
    }
    if (environment.isShelley()) {
      return (
        <div className={styles.shelleyTestnetWarning}>
          <span key="0" className={styles.shelleyTestnetWarningIcon}><ShelleyTestnetWarningSvg /></span>
          <div className={styles.text}>
            <FormattedMessage
              {...messages.shelleyTestnetLabel}
              values={{ network: environment.NETWORK }}
              key="1"
            />
          </div>
        </div>
      );
    }
    return (
      <div className={styles.testnetWarning}>
        <span key="0" className={styles.warningIcon}><WarningSvg /></span>
        <FormattedMessage
          {...messages.testnetLabel}
          values={{ faqLink, network: environment.NETWORK }}
          key="1"
        />
      </div>
    );
  }
}
