// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';
import styles from './ServerErrorBanner.scss';
import { ReactComponent as WarningSvg }  from '../../../assets/images/warning.inline.svg';
import type { ServerStatusErrorType } from '../../../types/serverStatusErrorType';
import { ServerStatusErrors } from '../../../types/serverStatusErrorType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  serverErrorLabel: {
    id: 'serverError.label.message',
    defaultMessage: '!!!WARNING: Server experiencing difficulties.<br>Please check <a target="blank" href="https://twitter.com/YoroiWallet">our Twitter account</a>.<br>The displayed balance and transaction history may appear incorrect until our servers are back to normal, but your actual balance is not affected.',
  },
  networkErrorLabel: {
    id: 'networkError.label.message',
    defaultMessage: '!!!Server connection failed <br/> Please check your internet connection or reach out to our support team <a target="_blank" href="https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335">here</a>.',
  },
});

type Props = {| +errorType: ServerStatusErrorType, |};


@observer
export default class ServerErrorBanner extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      errorType
    } = this.props;

    const displayMessage = (() => {
      switch (errorType) {
        case ServerStatusErrors.Server:
          return messages.serverErrorLabel;
        case ServerStatusErrors.Network:
          return messages.networkErrorLabel;
        default:
          return null;
      }
    })();

    return (
      <div>
        {displayMessage === null ? null : (
          <div className={styles.serverError}>
            <span key="0" className={styles.warningIcon}><WarningSvg /></span>
            <FormattedHTMLMessage {...displayMessage} key="1" />

          </div>)
        }
      </div>
    );
  }
}
