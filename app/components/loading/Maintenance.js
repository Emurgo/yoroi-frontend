// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, } from 'react-intl';
import ExternalLinkSVG from '../../assets/images/link-external.inline.svg';
import ErrorInfo from '../../assets/images/error-info.inline.svg';
import styles from './Maintenance.scss';
import globalMessages from '../../i18n/global-messages';
import VerticallyCenteredLayout from '../layout/VerticallyCenteredLayout';

const messages = defineMessages({
  title: {
    id: 'maintenance.screen.title',
    defaultMessage: '!!!Temporary Maintenance',
  },
  explanation: {
    id: 'maintenance.screen.explanation',
    defaultMessage: '!!!Yoroi is in maintenance mode. You can still access your funds through any other wallet software.',
  },
});

type Props = {|
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class Maintenance extends Component<Props> {

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
}
