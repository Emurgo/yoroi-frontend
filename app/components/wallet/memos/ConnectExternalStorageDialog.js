// @flow

import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import LinkExternalStorageSvg from '../../../assets/images/link-external-storage.inline.svg';
import globalMessages from '../../../i18n/global-messages';
import styles from './MemoDialogCommon.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  connectTitle: {
    id: 'settings.externalStorage.dialog.title',
    defaultMessage: '!!!Connect to external storage',
  },
  connectContent: {
    id: 'settings.externalStorage.dialog.content',
    defaultMessage: '!!!Memos will be encrypted so that your sensitive information is not leaked even if your external storage account is compromised',
  },
});

type Props = {|
  onCancel: void => void,
  onConnect: void => void,
|};

@observer
export default class ConnectExternalStorageDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { onCancel, onConnect, } = this.props;

    const actions = [
      {
        label: intl.formatMessage(globalMessages.cancel),
        onClick: onCancel
      },
      {
        label: this.context.intl.formatMessage(globalMessages.hwConnectDialogConnectButtonLabel),
        primary: true,
        onClick: onConnect,
      },
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
          <span className={styles.icon}><LinkExternalStorageSvg /></span>
          <p>{intl.formatMessage(messages.connectContent)}</p>
        </div>
      </Dialog>);
  }
}
