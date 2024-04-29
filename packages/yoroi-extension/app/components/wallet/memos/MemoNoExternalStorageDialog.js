// @flow

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog/Dialog';
import DialogCloseButton from '../../widgets/Dialog/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import styles from './MemoDialogCommon.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  connectTitle: {
    id: 'settings.noexternal.dialog.title',
    defaultMessage: '!!!No external storage',
  },
  connectContent: {
    id: 'settings.noexternal.dialog.content',
    defaultMessage: '!!!Your memos are stored locally. They will not automatically sync with other Yoroi instances and will be lost if you delete Yoroi',
  },
});

type Props = {|
  +onCancel: void => void,
  +onAcknowledge: void => void,
  +addExternal: void => void,
|};

@observer
export default class MemoNoExternalStorageDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onCancel, onAcknowledge, } = this.props;

    const acknowledgeAction = {
      label: this.context.intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel),
      primary: true,
      onClick: onAcknowledge,
    };
    const actions = [
      // TODO: replace cancel with addExternal once we add external memo storage
      {
        label: intl.formatMessage(globalMessages.cancel),
        onClick: onCancel
      },
      acknowledgeAction,
    ];

    return (
      <Dialog
        className={classnames([styles.component])}
        title={intl.formatMessage(messages.connectTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        closeButton={<DialogCloseButton />}
        onClose={onCancel}
      >
        <div className={styles.content}>
          <div>{intl.formatMessage(messages.connectContent)}</div>
        </div>
      </Dialog>);
  }
}
