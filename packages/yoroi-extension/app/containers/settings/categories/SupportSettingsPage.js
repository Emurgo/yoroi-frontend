// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import { downloadLogs } from '../../../utils/logging';
import IncludePublicKeyDialog from './IncludePublicKeyDialog';
import { ROUTES } from '../../../routes-config';
import type { StoresProps } from '../../../stores';

@observer
export default class SupportSettingsPage extends Component<StoresProps> {
  getPublicKey: void => void | string = () => {
    const { selected } = this.props.stores.wallets;
    if (selected == null) {
      return undefined;
    }
    return selected.publicKey;
  };

  handleDownloadLogs: () => void = () => {
    // TODO Removed some code here checking if it was an advanced user. Not sure about the possible solution
    // as we are removing Advanced user type
    const publicKey = this.getPublicKey();
    if (publicKey == null) {
      // if no public key to export, just download the logs right away
      return downloadLogs();
    }
    // TODO: don't show if not in "Advanced"
    // has public key -> prompt if they want to include it in the logs
    this.props.stores.uiDialogs.open({ dialog: IncludePublicKeyDialog });
  };

  getDialog: void => Node = () => {
    const { stores } = this.props;
    if (this.props.stores.uiDialogs.isOpen(IncludePublicKeyDialog)) {
      return (
        <IncludePublicKeyDialog
          downloadIncludingKey={() => downloadLogs(this.getPublicKey())}
          downloadExcludingKey={downloadLogs}
          stores={stores}
        />
      );
    }
    return null;
  };

  render(): Node {
    const { stores } = this.props;
    return (
      <>
        {this.getDialog()}
        <SupportSettings
          onExternalLinkClick={handleExternalLinkClick}
          onDownloadLogs={this.handleDownloadLogs}
          onPaperWalletTransfer={() => stores.routing.replaceRoute({ route: ROUTES.TRANSFER.ROOT })}
        />
      </>
    );
  }
}
