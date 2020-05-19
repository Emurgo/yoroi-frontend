// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import InvalidURIImg from '../../assets/images/uri/invalid-uri.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './URIInvalidDialog.scss';

const messages = defineMessages({
  uriInvalidTitle: {
    id: 'uri.invalid.dialog.title',
    defaultMessage: '!!!Invalid URL',
  },
  uriInvalidDialogWarningText1: {
    id: 'uri.invalid.dialog.warning.text1',
    defaultMessage: '!!!The link you clicked is invalid. Please ask the receiver to double-check the format.',
  },
  uriInvalidDialogWarningText2: {
    id: 'uri.invalid.dialog.warning.text2',
    defaultMessage: '!!!Please ask the receiver to double-check the format.',
  },
});

type Props = {|
  +onClose: void => void,
  +onSubmit: void => void,
|};

@observer
export default class URIInvalidDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { onClose, onSubmit, } = this.props;

    const dialogClasses = classnames([
      styles.component,
      'URIInvalidDialog'
    ]);

    const { intl } = this.context;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.continue),
        onClick: onSubmit,
        primary: true
      }
    ];

    return (
      <Dialog
        actions={actions}
        className={dialogClasses}
        title={intl.formatMessage(messages.uriInvalidTitle)}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onClose}
      >
        <div>
          <center>
            <span className={styles.invalidURIImg}><InvalidURIImg /></span>
          </center>
          <div className={styles.warningText}>
            {intl.formatMessage(messages.uriInvalidDialogWarningText1)}
            <br />
            {intl.formatMessage(messages.uriInvalidDialogWarningText2)}
          </div>
        </div>
      </Dialog>
    );
  }

}
