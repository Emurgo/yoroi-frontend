// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import SVGInline from 'react-svg-inline';

import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import performTxImg from '../../assets/images/uri/perform-tx-uri.inline.svg';

import styles from './URILandingDialog.scss';

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
  uriLandingDialogConfirmLabel: {
    id: 'uri.landing.dialog.confirm.label',
    defaultMessage: '!!!I understand',
  },
});

type Props = {
  onSubmit: void => void,
  onClose: void => void,
  classicTheme: boolean,
};

@observer
export default class URILandingDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  submit = () => {
    this.props.onSubmit();
  };

  render() {
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
        classicTheme={classicTheme}
        onClose={onClose}
      >
        <div>
          {!classicTheme && <SVGInline svg={performTxImg} className={styles.urlImage} />}
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
            label={intl.formatMessage(messages.uriLandingDialogConfirmLabel)}
            onMouseUp={this.submit}
            disabled={false}
            skin={ButtonSkin}
            className={classnames(['primary', styles.confirmButton])}
          />
        </div>
      </Dialog>
    );
  }

}
