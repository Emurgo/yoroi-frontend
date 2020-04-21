// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, } from 'react-intl';
import ExternalLinkSVG from '../../assets/images/link-external.inline.svg';
import ErrorInfo from '../../assets/images/error-info.inline.svg';
import styles from './Shutdown.scss';
import globalMessages from '../../i18n/global-messages';
import VerticallyCenteredLayout from '../layout/VerticallyCenteredLayout';

const messages = defineMessages({
  title: {
    id: 'shutdown.screen.title',
    defaultMessage: '!!!Temporary maintenance',
  },
  explanation: {
    id: 'shutdown.screen.explanation',
    defaultMessage: '!!!Yoroi is in maintenance mode. You can still access your funds through any other wallet software.',
  },
});

type Props = {|
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class Shutdown extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <div className={styles.dialog}>
          <div className={styles.header}>
            <VerticallyCenteredLayout>
              <div className={styles.title}>{intl.formatMessage(messages.title)}</div>
            </VerticallyCenteredLayout>
          </div>
          <div className={styles.errorLogo}>
            <ErrorInfo />
          </div>
          <div className={styles.body}>
            <div className={styles.attention}>
              {intl.formatMessage(globalMessages.attentionHeaderText)}
            </div>
            <br />
            <div className={styles.explanation}>
              {intl.formatMessage(messages.explanation)}
            </div>
            <div className={styles.learnMore}>
              <a
                href="https://twitter.com/YoroiWallet"
                onClick={event => this.props.onExternalLinkClick(event)}
              >
                {intl.formatMessage(globalMessages.learnMore) + ' '}
                <ExternalLinkSVG />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // _getErrorMessageComponent = (): Node => {
  //   const { intl } = this.context;
  //   const {
  //     onExternalLinkClick,
  //     downloadLogs
  //   } = this.props;

  //   const downloadLogsLink = (
  //     // eslint-disable-next-line jsx-a11y/anchor-is-valid
  //     <a
  //       className={styles.link}
  //       href="#"
  //       onClick={_event => downloadLogs()}
  //     >
  //       {intl.formatMessage(globalMessages.downloadLogsLink)}
  //     </a>
  //   );

  //   const supportRequestLink = (
  //     <a
  //       className={styles.link}
  //       href={intl.formatMessage(globalMessages.supportRequestLinkUrl)}
  //       onClick={event => onExternalLinkClick(event)}
  //     >
  //       {intl.formatMessage(globalMessages.contactSupport)}
  //     </a>
  //   );

  //   return (
  //     <p>
  //       <FormattedMessage {...globalMessages.logsContent} values={{ downloadLogsLink }} /><br />
  //       <FormattedMessage {...messages.error} values={{ supportRequestLink }} />
  //     </p>
  //   );
  // };

}
