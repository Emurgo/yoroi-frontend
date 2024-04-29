// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './ExportPublicKeyDialog.scss';
import { observer } from 'mobx-react';
import Dialog from '../../widgets/Dialog/Dialog';
import CodeBlock from '../../widgets/CodeBlock';
import DialogCloseButton from '../../widgets/Dialog/DialogCloseButton';
import QrCodeWrapper from '../../widgets/QrCodeWrapper';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { toDerivationPathString } from '../../../api/ada/lib/cardanoCrypto/keys/path';

export const messages: * = defineMessages({
  publicKeyExplanationLine1: {
    id: 'wallet.settings.publicExport.explanationLine1',
    defaultMessage: `!!!The below you can find your wallet's <strong>public</strong> key information.`,
  },
  reason1: {
    id: 'wallet.settings.publicExport.reason1',
    defaultMessage: '!!!Open your wallet in read-only mode in Yoroi Mobile to easily check your balance at any time',
  },
  reason2: {
    id: 'wallet.settings.publicExport.reason2',
    defaultMessage: '!!!Share your key with tax software to automatically generate tax reports',
  },
});

type Props = {|
  +onClose: void => void,
  +publicKeyHex: string,
  +pathToPublic: Array<number>
|};

@observer
export default class ExportPublicKeyDialog extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const walletInfo = {
      publicKeyHex: this.props.publicKeyHex,
      path: this.props.pathToPublic,
    };

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.exportButtonLabel)}
        closeOnOverlayClick={false}
        onClose={this.props.onClose}
        closeButton={<DialogCloseButton />}
        className="ExportWalletDialogContainer"
      >
        <div className={styles.component}>
          <div className={styles.header}>
            <p><FormattedHTMLMessage {...messages.publicKeyExplanationLine1} /></p>
            <p><FormattedHTMLMessage {...globalMessages.publicKeyExplanation} /></p>
            <p>{intl.formatMessage(globalMessages.whyUse)}</p>
            <ul>
              <li key="1">{intl.formatMessage(messages.reason1)}</li>
              <li key="2">{intl.formatMessage(messages.reason2)}</li>
            </ul>
          </div>
          {this.renderQrCode(walletInfo)}
          {this.renderKey(walletInfo.publicKeyHex)}
          {this.renderPath(walletInfo.path)}
        </div>
      </Dialog>
    );
  }

  renderQrCode: {|
    publicKeyHex: string,
    path: Array<number>,
  |} => Node = (walletInfo) => {
    return (
      <>
        <div align="center">
          <QrCodeWrapper
            value={JSON.stringify(walletInfo)}
            size={152}
          />
        </div>
        <br />
        <br />
      </>
    );
  }

  renderKey: string => Node = (key) => {
    const { intl } = this.context;
    return (
      <>
        <span className={styles.label}>
          {intl.formatMessage(globalMessages.keyLabel)}
        </span>
        <CodeBlock
          code={key}
        />
        <br />
      </>
    );
  }

  renderPath: Array<number> => Node = (addressing) => {
    const { intl } = this.context;
    return (
      <>
        <span className={styles.label}>
          {intl.formatMessage(globalMessages.derivationPathLabel)}
        </span>
        <div className={styles.derivation}>
          <div className={styles.hash}>
            {toDerivationPathString(addressing)}
          </div>
        </div>
        <br />
      </>
    );
  }
}
