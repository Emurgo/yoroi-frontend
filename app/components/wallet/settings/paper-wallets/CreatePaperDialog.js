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
import { PdfGenSteps } from '../../../../api/ada/paperWallet/paperWalletPdf';
import type { PdfGenStepType } from '../../../../api/ada/paperWallet/paperWalletPdf';

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
  pdfGenInitializing: {
    id: 'settings.paperWallet.dialog.createPaper.initializing',
    defaultMessage: '!!!Initializing the document',
  },
  pdfGenBackground: {
    id: 'settings.paperWallet.dialog.createPaper.background',
    defaultMessage: '!!!Drawing pretty background',
  },
  pdfGenFrontpage: {
    id: 'settings.paperWallet.dialog.createPaper.frontpage',
    defaultMessage: '!!!Preparing the front page',
  },
  pdfGenBackpage: {
    id: 'settings.paperWallet.dialog.createPaper.backpage',
    defaultMessage: '!!!Preparing the back page',
  },
  pdfGenMnemonic: {
    id: 'settings.paperWallet.dialog.createPaper.mnemonic',
    defaultMessage: '!!!Printing mnemonics',
  },
  pdfGenAddresses: {
    id: 'settings.paperWallet.dialog.createPaper.addresses',
    defaultMessage: '!!!Drawing the address',
  },
  pdfGenDone: {
    id: 'settings.paperWallet.dialog.createPaper.done',
    defaultMessage: '!!!All done!',
  },
});

type Props = {|
  renderStatus: ?PdfGenStepType,
  paperFile: ?Blob,
  onNext: Function,
  onCancel: Function,
  onDownload: Function,
  onDataChange: Function,
  classicTheme: boolean,
|};

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

  statusToMessage(status: ?PdfGenStepType): string {
    const defaultMessage = '...';
    switch (status) {
      case PdfGenSteps.initializing:
        return this.context.intl.formatMessage(messages.pdfGenInitializing);
      case PdfGenSteps.background:
        return this.context.intl.formatMessage(messages.pdfGenBackground);
      case PdfGenSteps.frontpage:
        return this.context.intl.formatMessage(messages.pdfGenFrontpage);
      case PdfGenSteps.backpage:
        return this.context.intl.formatMessage(messages.pdfGenBackpage);
      case PdfGenSteps.mnemonic:
        return this.context.intl.formatMessage(messages.pdfGenMnemonic);
      case PdfGenSteps.addresses:
        return this.context.intl.formatMessage(messages.pdfGenAddresses);
      case PdfGenSteps.done:
        return this.context.intl.formatMessage(messages.pdfGenDone);
      default:
        return defaultMessage;
    }
  }

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
    const downloadPaperIntroLine1ClassNames = classnames([
      classicTheme ? headerMixin.headerBlockClassic : headerMixin.headerBlock,
      styles.downloadPaperIntroLine1,
    ]);

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
          closeOnOverlayClick={false}
          onClose={onCancel}
          className={dialogClasses}
          closeButton={<DialogCloseButton onClose={onCancel} />}
          classicTheme={classicTheme}
        >
          <div className={downloadPaperIntroLine1ClassNames}>
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
        closeOnOverlayClick={false}
        onClose={onCancel}
        className={dialogClasses}
        closeButton={<DialogCloseButton onClose={onCancel} />}
        classicTheme={classicTheme}
      >
        <AnnotatedLoader
          title={this.context.intl.formatMessage(messages.progressTitleCreatePaperWallet)}
          details={this.statusToMessage(renderStatus)}
        />
      </Dialog>
    );
  }
}
