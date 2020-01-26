// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import styles from './InternalHeader.scss';
import WarningBox from '../../widgets/WarningBox';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';
import VerticallyCenteredLayout from '../../layout/VerticallyCenteredLayout';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  warning1: {
    id: 'wallet.receive.page.internalWarning1',
    defaultMessage: 'Internal addresses (or "change" addresses) maintain your privacy by obscuring which addresses belong to you on the blockchain'
  },
  warning2: {
    id: 'wallet.receive.page.internalWarning2',
    defaultMessage: 'Internal addresses are shown here for personal auditing purposes and you should <strong>never</strong> be used.'
  },
});

type Props = {|
|};

@observer
export default class InternalHeader extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <div className={styles.warningSection}>
          
            <div className={styles.attentionLabel}>
              <p>{intl.formatMessage(globalMessages.attentionHeaderText)}</p>
            </div>
            <div className={styles.text}>
              <p>{intl.formatMessage(messages.warning1)}</p><br />
              <p><FormattedHTMLMessage {...messages.warning2} /></p>
            </div>
        </div>
        <div className={styles.invalidURIImg}>
          <VerticallyCenteredLayout>
            <InvalidURIImg />
          </VerticallyCenteredLayout>
        </div>
      </div>
    );
  }
}
