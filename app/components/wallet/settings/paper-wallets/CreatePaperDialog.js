// @flow
import React, { Component } from 'react';
import SVGInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import Dialog from '../../../widgets/Dialog';
import globalMessages from '../../../../i18n/global-messages';
import styles from './CreatePaperDialog.scss';
import headerMixin from '../../../mixins/HeaderBlock.scss';
import AnnotatedLoader from '../../../transfer/AnnotatedLoader';
import download from '../../../../assets/images/import-ic.inline.svg';

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
  downloadPaperIntroLine1: {
    id: 'settings.paperWallet.dialog.createPaper.download.intro.line1',
    defaultMessage: '!!!Your paper wallet PDF is ready',
  },
  downloadPaperIntroLine2: {
    id: 'settings.paperWallet.dialog.createPaper.download.intro.line2',
    defaultMessage: '!!!Download size (Mb)',
  },
});

type Props = {
  renderStatus: ?string,
  paperFile: ?Blob,
  onNext: Function,
  onCancel: Function,
  onDownload: Function,
  onDataChange: Function,
  classicTheme: boolean,
};

@observer
export default class CreatePaperDialog extends Component<Props> {

  static formatBytes = (bytes: number): string => {
    const mb = (bytes / 1024) / 1024;
    return mb.toFixed(2);
  };

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
      renderStatus,
      classicTheme,
    } = this.props;

    const dialogClasses = classnames(['createPaperDialog', styles.dialog]);
    const confirmButtonClasses = classnames(['confirmButton']);
    const buttonClassNames = classnames(['primary', styles.button]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.nextButtonLabel),
        onClick: onNext,
        primary: true,
        className: confirmButtonClasses,
        disabled: !paperFile
      },
    ];

    if (paperFile) {
      const pdfSizeMb = CreatePaperDialog.formatBytes(paperFile.size);
      return (
        <Dialog
          title={intl.formatMessage(messages.dialogTitleCreatePaperWallet)}
          actions={actions}
          closeOnOverlayClick
          onClose={onCancel}
          className={dialogClasses}
          closeButton={<DialogCloseButton onClose={onCancel} />}
          classicTheme={classicTheme}
        >
          <div className={classicTheme ? headerMixin.headerBlockClassic : headerMixin.headerBlock}>
            <span>{intl.formatMessage(messages.downloadPaperIntroLine1)}</span>
          </div>
          <center>
            <button
              type="button"
              className={buttonClassNames}
              onClick={onDownload}
            >
              <SVGInline svg={download} className={styles.icon} /><br />
              <span className={styles.label}>
                {this.context.intl.formatMessage(messages.downloadPaperButtonLabel)}
              </span><br />
              <span className={styles.label}>
                {intl.formatMessage(messages.downloadPaperIntroLine2)}: {pdfSizeMb}
              </span>
            </button>
          </center>
        </Dialog>
      );

    }

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitleCreatePaperWallet)}
        actions={actions}
        closeOnOverlayClick
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
        classicTheme={classicTheme}
      >
        <AnnotatedLoader
          title={this.context.intl.formatMessage(messages.progressTitleCreatePaperWallet)}
          details={renderStatus || '...'}
        />
      </Dialog>
    );
  }
}
