// @flow

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import linkExternalStorageSvg from '../../../assets/images/link-external-storage.inline.svg';
import styles from './MemoDialogCommon.scss';


const messages = defineMessages({
  connectTitle: {
    id: 'settings.externalStorage.dialog.title',
    defaultMessage: '!!!Connect to external storage',
  },
  connectContent: {
    id: 'settings.externalStorage.dialog.content',
    defaultMessage: '!!!To add private memos to the transactions you need to connect Yoroi to your Dropbox account',
  },
  connectActionsCancel: {
    id: 'settings.externalStorage.dialog.actions.cancel',
    defaultMessage: '!!!Cancel',
  },
  connectActionsConnect: {
    id: 'settings.externalStorage.dialog.actions.connect',
    defaultMessage: '!!!Connect',
  },
});

type Props = {|
  onCancel: Function,
  onConnect: Function,
  classicTheme: boolean,
|};

@observer
export default class ConnectExternalStorageDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { onCancel, onConnect, classicTheme } = this.props;

    const actions = [
      {
        label: intl.formatMessage(messages.connectActionsCancel),
        onClick: onCancel
      },
      {
        label: this.context.intl.formatMessage(messages.connectActionsConnect),
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
        classicTheme={classicTheme}
      >
        <div className={styles.content}>
          <SvgInline svg={linkExternalStorageSvg} className={styles.icon} />
          <p>{intl.formatMessage(messages.connectContent)}</p>
        </div>
      </Dialog>);
  }
}
