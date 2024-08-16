// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import { downloadLogs } from '../../../utils/logging';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import IncludePublicKeyDialog from './IncludePublicKeyDialog';
import { ComplexityLevels } from '../../../types/complexityLevelType';

@observer
export default class SupportSettingsPage extends Component<StoresAndActionsProps> {
  getPublicKey: void => void | string = () => {
    const { selected } = this.props.stores.wallets;
    if (selected == null) {
      return undefined;
    }
    return selected.publicKey;
  };

  handleDownloadLogs: () => void = () => {
    if (this.props.stores.profile.selectedComplexityLevel !== ComplexityLevels.Advanced) {
      // if user is a basic user, they probably don't know what is a public and private key
      // or the implications of exporting them
      // so showing a dialog will probably confuse them and discourage them from sending logs at all
      // to avoid this, we just assume they don't want to share their public key
      // worst case, we can follow-up with them in a support ticket
      return downloadLogs();
    }
    const publicKey = this.getPublicKey();
    if (publicKey == null) {
      // if no public key to export, just download the logs right away
      return downloadLogs();
    }
    // TODO: don't show if not in "Advanced"
    // has public key -> prompt if they want to include it in the logs
    this.props.actions.dialogs.open.trigger({ dialog: IncludePublicKeyDialog });
  };

  getDialog: void => Node = () => {
    const { actions, stores } = this.props;
    if (this.props.stores.uiDialogs.isOpen(IncludePublicKeyDialog)) {
      return (
        <IncludePublicKeyDialog
          downloadIncludingKey={() => downloadLogs(this.getPublicKey())}
          downloadExcludingKey={downloadLogs}
          actions={actions}
          stores={stores}
        />
      );
    }
    return null;
  };

  render(): Node {
    return (
      <>
        {this.getDialog()}
        <SupportSettings
          onExternalLinkClick={handleExternalLinkClick}
          onDownloadLogs={this.handleDownloadLogs}
        />
      </>
    );
  }
}
