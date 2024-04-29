// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import Dialog from '../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../widgets/Dialog/DialogCloseButton';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './BaseWarningDialog.scss';

const messages = defineMessages({
  explanation2: {
    id: 'wallet.debugwallet.explanation2',
    defaultMessage: '!!!To avoid any issues, do not use this wallet.<br />Instead, use Yoroi to create a new wallet.',
  },
  explanation3: {
    id: 'wallet.debugwallet.explanation3',
    defaultMessage: '!!!If you did not expect this message, please {contactSupportLink}.',
  },
});

type Props = {|
  +onClose: void => void,
  +onExternalLinkClick: MouseEvent => void,
  +explanationHeader: Node,
|};

@observer
export default class BaseWarningDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };


  render(): Node {
    const { intl } = this.context;

    const contactSupportLink = (
      <a
        className={styles.link}
        href='https://emurgohelpdesk.zendesk.com/hc/en-us/requests/new?ticket_form_id=360013330335'
        onClick={event => this.props.onExternalLinkClick(event)}
      >
        {intl.formatMessage(globalMessages.contactSupport)}
      </a>
    );

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.attentionTitle)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={this.props.onClose}
      >
        <div className={styles.component}>
          <div className={styles.header}>
            {this.props.explanationHeader}
            <FormattedHTMLMessage {...messages.explanation2} />
          </div>
          <FormattedMessage {...messages.explanation3} values={{ contactSupportLink }} />
        </div>
      </Dialog>
    );
  }
}
