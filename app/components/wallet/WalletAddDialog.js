// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import styles from './WalletAddDialog.scss';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import Dialog from '../widgets/Dialog';
import DialogCloseButton from '../widgets/DialogCloseButton';
import createIcon from '../../assets/images/create-ic.inline.svg';
import importIcon from '../../assets/images/import-ic.inline.svg';
import joinSharedIcon from '../../assets/images/join-shared-ic.inline.svg';
import restoreIcon from '../../assets/images/restore-ic.inline.svg';
// import environment from '../../environment';

const messages = defineMessages({
  title: {
    id: 'wallet.add.dialog.title.label',
    defaultMessage: '!!!Add wallet',
    description: 'Label for the "Add wallet" title on the wallet add dialog.'
  },
  createLabel: {
    id: 'wallet.add.dialog.create.label',
    defaultMessage: '!!!Create',
    description: 'Label for the "Create" button on the wallet add dialog.'
  },
  createDescription: {
    id: 'wallet.add.dialog.create.description',
    defaultMessage: '!!!Create a new wallet',
    description: 'Description for the "Create" button on the wallet add dialog.'
  },
  joinLabel: {
    id: 'wallet.add.dialog.join.label',
    defaultMessage: '!!!Join',
    description: 'Label for the "Join" button on the wallet add dialog.'
  },
  joinDescription: {
    id: 'wallet.add.dialog.join.description',
    defaultMessage: '!!!Join a shared wallet with up to 5 people',
    description: 'Description for the "Join" button on the wallet add dialog.'
  },
  restoreLabel: {
    id: 'wallet.add.dialog.restore.label',
    defaultMessage: '!!!Restore',
    description: 'Label for the "Restore" button on the wallet add dialog.'
  },
  restoreDescription: {
    id: 'wallet.add.dialog.restore.description',
    defaultMessage: '!!!Restore wallet from backup',
    description: 'Description for the "Restore" button on the wallet add dialog.'
  },
  importLabel: {
    id: 'wallet.add.dialog.import.label',
    defaultMessage: '!!!Import',
    description: 'Label for the "Import" button on the wallet add dialog.'
  },
  importDescription: {
    id: 'wallet.add.dialog.import.description',
    defaultMessage: '!!!Import wallet from a file',
    description: 'Description for the "Import" button on the wallet add dialog.'
  }
});

type Props = {
  onCreate: Function,
  onRestore: Function,
  onCancel: Function,
  onImportFile: Function,
  canClose: boolean,
};

@observer
export default class WalletAddDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { onCreate, onRestore, onCancel, canClose, onImportFile } = this.props;
    const dialogClasses = classnames([
      styles.component,
      'WalletAddDialog',
    ]);
    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(messages.title)}
        closeOnOverlayClick
        onClose={canClose ? onCancel : null}
        closeButton={canClose && <DialogCloseButton />}
      >
        <div className={styles.buttonsContainer}>
          <div className={styles.firstRow}>
            <Button
              className="primary createWalletButton"
              label={intl.formatMessage(messages.createDescription)}
              onMouseUp={onCreate}
              skin={<SimpleButtonSkin />}
            />
            <Button
              className="primary restoreWalletButton"
              label={intl.formatMessage(messages.restoreDescription)}
              onMouseUp={onRestore}
              skin={<SimpleButtonSkin />}
            />
          </div>
        </div>
      </Dialog>
    );
  }

}
