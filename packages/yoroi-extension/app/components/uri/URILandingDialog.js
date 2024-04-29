// @flow
import type { Node } from 'react';
import { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../widgets/Dialog/Dialog';
import DialogCloseButton from '../widgets/Dialog/DialogCloseButton';
import { ReactComponent as PerformTxImg }  from '../../assets/images/uri/perform-tx-uri.inline.svg';

import styles from './URILandingDialog.scss';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  uriLandingDialogTitle: {
    id: 'uri.landing.dialog.title',
    defaultMessage: '!!!Perform a transaction from a Cardano URL',
  },
  uriLandingDialogWarningLine1: {
    id: 'uri.landing.dialog.warning.line1',
    defaultMessage: '!!!Make sure:',
  },
  uriLandingDialogWarningLine2: {
    id: 'uri.landing.dialog.warning.line2',
    defaultMessage: "!!!You are on Yoroi's official extension.",
  },
  uriLandingDialogWarningLine3: {
    id: 'uri.landing.dialog.warning.line3',
    defaultMessage: '!!!You are not being victim of a phishing or man-in-the-middle attack.',
  },
});

type Props = {|
  +onSubmit: void => void,
  +onClose: void => void,
  +classicTheme: boolean,
|};

@observer
export default class URILandingDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  submit: (() => void) = () => {
    this.props.onSubmit();
  };

  render(): Node {
    const { onClose, classicTheme } = this.props;
    const { intl } = this.context;

    const dialogClasses = classnames([
      styles.component,
      'URILandingDialog'
    ]);

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(messages.uriLandingDialogTitle)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onClose}
      >
        <div>
          {!classicTheme && <span className={styles.urlImage}><PerformTxImg /></span>}
          <div className={styles.warningText}>
            {intl.formatMessage(messages.uriLandingDialogWarningLine1)}
            <ul>
              <li>
                {intl.formatMessage(messages.uriLandingDialogWarningLine2)}
              </li>
              <li>
                {intl.formatMessage(messages.uriLandingDialogWarningLine3)}
              </li>
            </ul>
          </div>
          <Button
            variant="primary"
            onClick={this.submit}
            sx={{ margin: '30px auto 0', display: 'block' }}
          >
            {intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel)}
          </Button>
        </div>
      </Dialog>
    );
  }

}
