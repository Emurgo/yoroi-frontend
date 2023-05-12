// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';

import styles from './DoneDialog.scss';

const messages = defineMessages({
  lineTitle: {
    id: 'wallet.voting.dialog.step.done.lineTitle',
    defaultMessage: '!!!Voting key registered.',
  },
});

type Props = {|
  +onExternalLinkClick: MouseEvent => void,
  +submit: void => PossiblyAsync<void>,
  +cancel: void => void,
  +classicTheme: boolean,
|};

@observer
export default class DoneDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { submit, cancel } = this.props;

    const dialogActions = [
      {
        label: intl.formatMessage(globalMessages.close),
        primary: true,
        onClick: submit,
      },
    ];

    return (
      <Dialog
        className={classnames([styles.dialog])}
        title={intl.formatMessage(globalMessages.votingRegistrationTitle)}
        actions={dialogActions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={cancel}
      >
        <div className={classnames([styles.lineTitle, styles.firstItem])}>
          {intl.formatMessage(messages.lineTitle)}
        </div>

      </Dialog>
    );
  }
}
