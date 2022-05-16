// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, } from 'react-intl';
import { ReactComponent as ExternalLinkSVG }  from '../../assets/images/link-external.inline.svg';
import styles from './Maintenance.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import UnavailableDialog from '../widgets/UnavailableDialog';

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

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <UnavailableDialog
        title={intl.formatMessage(messages.title)}
      >
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
      </UnavailableDialog>
    );
  }
}
