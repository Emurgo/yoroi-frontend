// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import { downloadLogs } from '../../../utils/logging';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import type { IGetPublic } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { PublicKeyCache } from '../../../stores/toplevel/WalletStore';
import { asGetPublicKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import IncludePublicKeyDialog from './IncludePublicKeyDialog';
import type { GeneratedData as IncludePublicKeyDialogData } from './IncludePublicKeyDialog';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { ComplexityLevels } from '../../../types/complexityLevelType';

type GeneratedData = typeof SupportSettingsPage.prototype.generated;

@observer
export default class SupportSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {
  getPublicKey: void => void | string = () => {
    const { selected } = this.generated.stores.wallets;
    if (selected == null) {
      return undefined;
    }
    const withPublicKey = asGetPublicKey(selected);
    if (withPublicKey == null) {
      return undefined;
    }
    const { publicKey } = this.generated.stores.wallets.getPublicKeyCache(withPublicKey);
    return publicKey;
  };

  handleDownloadLogs: () => void = () => {
    if (this.generated.stores.profile.selectedComplexityLevel !== ComplexityLevels.Advanced) {
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
    this.generated.actions.dialogs.open.trigger({ dialog: IncludePublicKeyDialog });
  };

  getDialog: void => Node = () => {
    if (this.generated.stores.uiDialogs.isOpen(IncludePublicKeyDialog)) {
      return (
        <IncludePublicKeyDialog
          downloadIncludingKey={() => downloadLogs(this.getPublicKey())}
          downloadExcludingKey={downloadLogs}
          {...this.generated.IncludePublicKeyDialogProps}
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

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      uiDialogs: {|
        isOpen: any => boolean,
      |},
      profile: {|
        selectedComplexityLevel: ?ComplexityLevelType,
      |},
      wallets: {|
        getPublicKeyCache: IGetPublic => PublicKeyCache,
        selected: null | PublicDeriver<>,
      |},
    |},
    IncludePublicKeyDialogProps: InjectedOrGenerated<IncludePublicKeyDialogData>,
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SupportSettingsPage)} no way to generated props`);
    }
    const { actions, stores } = this.props;
    return Object.freeze({
      actions: {
        dialogs: {
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
      },
      stores: {
        profile: {
          selectedComplexityLevel: stores.profile.selectedComplexityLevel,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
        wallets: {
          selected: stores.wallets.selected,
          getPublicKeyCache: stores.wallets.getPublicKeyCache,
        },
      },
      IncludePublicKeyDialogProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<IncludePublicKeyDialogData>),
    });
  }
}
