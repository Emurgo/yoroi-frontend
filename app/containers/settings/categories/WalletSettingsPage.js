// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import WalletNameSetting from '../../../components/wallet/settings/WalletNameSetting';
import NoWalletMessage from '../../wallet/NoWalletMessage';
import SpendingPasswordSetting from '../../../components/wallet/settings/SpendingPasswordSetting';
import ResyncBlock from '../../../components/wallet/settings/ResyncBlock';
import RemoveWallet from '../../../components/wallet/settings/RemoveWallet';
import type { GeneratedData as RemoveWalletDialogContainerData } from './RemoveWalletDialogContainer';
import RemoveWalletDialogContainer from './RemoveWalletDialogContainer';
import type { GeneratedData as ResyncWalletDialogContainerData } from './ResyncWalletDialogContainer';
import ResyncWalletDialogContainer from './ResyncWalletDialogContainer';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { isValidWalletName } from '../../../utils/validations';
import ChangeWalletPasswordDialogContainer from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { asGetSigningKey } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { GeneratedData as ChangeWalletPasswordDialogContainerData } from '../../wallet/dialogs/ChangeWalletPasswordDialogContainer';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { ConceptualWallet } from '../../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { ConceptualWalletSettingsCache } from '../../../stores/toplevel/WalletSettingsStore';
import type { SigningKeyCache } from '../../../stores/toplevel/WalletStore';
import LocalizableError from '../../../i18n/LocalizableError';
import type { RenameModelFunc } from '../../../api/common/index';
import type { IGetSigningKey } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';

type GeneratedData = typeof WalletSettingsPage.prototype.generated;

@observer
export default class WalletSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  render(): Node {
    const { profile, walletSettings } = this.generated.stores;
    const { actions, } = this.generated;
    const {
      renameModelRequest,
      lastUpdatedWalletField,
      walletFieldBeingEdited,
    } = walletSettings;
    const {
      startEditingWalletField,
      stopEditingWalletField,
      cancelEditingWalletField,
      renameConceptualWallet,
    } = actions.walletSettings;

    const walletsStore = this.generated.stores.wallets;
    if (walletsStore.selected == null) {
      return (
        <>
          {this.getDialog(undefined)}
          <NoWalletMessage />
        </>
      );
    }
    const selectedWallet = walletsStore.selected;
    const withSigning = asGetSigningKey(selectedWallet);
    const parent = selectedWallet.getParent();
    const settingsCache = this.generated.stores.walletSettings
      .getConceptualWalletSettingsCache(parent);

    return (
      <>
        {this.getDialog(selectedWallet)}
        <WalletNameSetting
          error={renameModelRequest.error}
          walletName={settingsCache.conceptualWalletName}
          isSubmitting={renameModelRequest.isExecuting}
          isInvalid={
            renameModelRequest.wasExecuted
            &&
            renameModelRequest.result === false
          }
          lastUpdatedField={lastUpdatedWalletField}
          onFieldValueChange={async (field, value) => {
            if (field === 'name') {
              await renameConceptualWallet.trigger({
                publicDeriver: selectedWallet,
                newName: value,
              });
            }
          }}
          onStartEditing={field => startEditingWalletField.trigger({ field })}
          onStopEditing={() => stopEditingWalletField.trigger()}
          onCancelEditing={() => cancelEditingWalletField.trigger()}
          activeField={walletFieldBeingEdited}
          nameValidator={name => isValidWalletName(name)}
          classicTheme={profile.isClassicTheme}
        />
        {withSigning != null && (
          <SpendingPasswordSetting
            openDialog={() => actions.dialogs.open.trigger({
              dialog: ChangeWalletPasswordDialogContainer,
            })}
            walletPasswordUpdateDate={
              this.generated.stores.wallets.getSigningKeyCache(withSigning).signingKeyUpdateDate
            }
            classicTheme={profile.isClassicTheme}
          />
        )}
        <ResyncBlock
          openDialog={() => actions.dialogs.open.trigger({
            dialog: ResyncWalletDialogContainer,
          })}
        />
        <RemoveWallet
          walletName={settingsCache.conceptualWalletName}
          openDialog={() => actions.dialogs.open.trigger({
            dialog: RemoveWalletDialogContainer,
          })}
        />
      </>
    );
  }

  getDialog: (void | PublicDeriver<>) => Node = (
    publicDeriver
  ) => {
    const { isOpen } = this.generated.stores.uiDialogs;
    if (publicDeriver != null && isOpen(ChangeWalletPasswordDialogContainer)) {
      return (
        <ChangeWalletPasswordDialogContainer
          {...this.generated.ChangeWalletPasswordDialogContainerProps}
          publicDeriver={publicDeriver}
        />
      );
    }
    // selected wallet becomes null as we delete it
    if (isOpen(RemoveWalletDialogContainer)) {
      return (
        <RemoveWalletDialogContainer
          {...this.generated.RemoveWalletDialogContainerProps}
          publicDeriver={publicDeriver}
        />
      );
    }
    if (publicDeriver != null && isOpen(ResyncWalletDialogContainer)) {
      return (
        <ResyncWalletDialogContainer
          {...this.generated.ResyncWalletDialogContainerProps}
          publicDeriver={publicDeriver}
        />
      );
    }
    return null;
  }

  @computed get generated(): {|
    ChangeWalletPasswordDialogContainerProps:
      InjectedOrGenerated<ChangeWalletPasswordDialogContainerData>,
    RemoveWalletDialogContainerProps: InjectedOrGenerated<RemoveWalletDialogContainerData>,
    ResyncWalletDialogContainerProps: InjectedOrGenerated<ResyncWalletDialogContainerData>,
    actions: {|
      dialogs: {|
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |}
      |},
      walletSettings: {|
        cancelEditingWalletField: {|
          trigger: (params: void) => void
        |},
        renameConceptualWallet: {|
          trigger: (params: {|
            newName: string,
            publicDeriver: PublicDeriver<>
          |}) => Promise<void>
        |},
        startEditingWalletField: {|
          trigger: (params: {| field: string |}) => void
        |},
        stopEditingWalletField: {|
          trigger: (params: void) => void
        |}
      |}
    |},
    stores: {|
      profile: {| isClassicTheme: boolean |},
      uiDialogs: {| isOpen: any => boolean |},
      walletSettings: {|
        getConceptualWalletSettingsCache: ConceptualWallet => ConceptualWalletSettingsCache,
        lastUpdatedWalletField: null | string,
        renameModelRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          result: ?PromisslessReturnType<RenameModelFunc>,
          wasExecuted: boolean
        |},
        walletFieldBeingEdited: null | string
      |},
      wallets: {|
        getSigningKeyCache: IGetSigningKey => SigningKeyCache,
        selected: null | PublicDeriver<>
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSettingsPage)} no way to generated props`);
    }
    const { actions, stores, } = this.props;
    const settingActions = actions.walletSettings;
    const settingStore = this.props.stores.walletSettings;
    return Object.freeze({
      stores: {
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
        },
        walletSettings: {
          getConceptualWalletSettingsCache: settingStore.getConceptualWalletSettingsCache,
          renameModelRequest: {
            error: settingStore.renameModelRequest.error,
            isExecuting: settingStore.renameModelRequest.isExecuting,
            wasExecuted: settingStore.renameModelRequest.wasExecuted,
            result: settingStore.renameModelRequest.result,
          },
          lastUpdatedWalletField: settingStore.lastUpdatedWalletField,
          walletFieldBeingEdited: settingStore.walletFieldBeingEdited,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
        wallets: {
          selected: stores.wallets.selected,
          getSigningKeyCache: stores.wallets.getSigningKeyCache,
        },
      },
      actions: {
        walletSettings: {
          startEditingWalletField: { trigger: settingActions.startEditingWalletField.trigger },
          stopEditingWalletField: { trigger: settingActions.stopEditingWalletField.trigger },
          cancelEditingWalletField: { trigger: settingActions.cancelEditingWalletField.trigger },
          renameConceptualWallet: { trigger: settingActions.renameConceptualWallet.trigger },
        },
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
        },
      },
      ChangeWalletPasswordDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<ChangeWalletPasswordDialogContainerData>
      ),
      RemoveWalletDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<RemoveWalletDialogContainerData>
      ),
      ResyncWalletDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<ResyncWalletDialogContainerData>
      ),
    });
  }
}
