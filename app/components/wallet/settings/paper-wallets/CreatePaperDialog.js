// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputSkin } from 'react-polymorph/lib/skins/simple/InputSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import Dialog from '../../../widgets/Dialog';
import {isValidWalletPassword, isValidRepeatPassword, isValidPaperPassword} from '../../../../utils/validations';
import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './CreatePaperDialog.scss';
import config from '../../../../config';
import type { AdaPaper } from "../../../../api/ada";
import AnnotatedLoader from "../../../transfer/AnnotatedLoader";

const messages = defineMessages({
  dialogTitleCreatePaperWallet: {
    id: 'settings.paperWallet.dialog.createPaper.title',
    defaultMessage: '!!!Create Paper Wallet',
  },
  progressTitleCreatePaperWallet: {
    id: 'settings.paperWallet.dialog.createPaper.loader.label',
    defaultMessage: '!!!Rendering PDF Certificate',
  },
  downloadPaperButtonLabel: {
    id: 'settings.paperWallet.dialog.createPaper.download.label',
    defaultMessage: '!!!Download Paper Wallet Certificate',
  },
});

type Props = {
  paperFile: Blob,
  onNext: Function,
  onCancel: Function,
  onDownload: Function,
  onDataChange: Function,
};

@observer
export default class CreatePaperDialog extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  handleDataChange = (key: string, value: string) => {
    this.props.onDataChange({ [key]: value });
  };

  render() {
    const { intl } = this.context;
    const {
      onNext,
      onCancel,
      paperFile,
      onDownload,
    } = this.props;

    const dialogClasses = classnames(['createPaperDialog', styles.dialog]);
    const confirmButtonClasses = classnames(['confirmButton']);
    const buttonClassNames = classnames(["primary", styles.button]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        onClick: onNext,
        primary: true,
        className: confirmButtonClasses,
        disabled: !paperFile
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleCreatePaperWallet)}
        actions={actions}
        closeOnOverlayClick
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
      >

        {
          paperFile ? (
            <Button
              className={buttonClassNames}
              label={this.context.intl.formatMessage(messages.downloadPaperButtonLabel)}
              skin={ButtonSkin}
              onClick={onDownload}
            />
          ) : (
            <AnnotatedLoader
              title={this.context.intl.formatMessage(messages.progressTitleCreatePaperWallet)}
              details={"..."}
            />
          )
        }

      </Dialog>
    );
  }

}
