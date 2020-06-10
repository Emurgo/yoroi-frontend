// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { handleExternalClick } from '../../../utils/routing';
import ExternalStorageSettings from '../../../components/settings/categories/ExternalStorageSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { ProvidersType } from '../../../api/externalStorage/index';
import type { SelectedExternalStorageProvider } from '../../../domain/ExternalStorage';

type GeneratedData = typeof ExternalStorageSettingsPage.prototype.generated;

@observer
export default class ExternalStorageSettingsPage
  extends Component<InjectedOrGenerated<GeneratedData>> {

  onConnect: string => void = (authorizeUrl) => {
    // Open authorize url
    handleExternalClick(authorizeUrl);
  };

  onDisconnect: void => Promise<void> = async () => {
    await this.generated.actions.memos.unsetExternalStorageProvider.trigger();
  };

  render(): Node {
    const {
      providers,
      selectedProvider
    } = this.generated.stores.memos;

    return (
      <ExternalStorageSettings
        onConnect={this.onConnect}
        onDisconnect={this.onDisconnect}
        externalStorageProviders={providers}
        selectedExternalStorage={selectedProvider}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      memos: {|
        unsetExternalStorageProvider: {|
          trigger: (params: void) => Promise<void>
        |}
      |}
    |},
    stores: {|
      memos: {|
        providers: { [key: string]: ProvidersType, ... },
        selectedProvider: ?SelectedExternalStorageProvider
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ExternalStorageSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        memos: {
          providers: stores.memos.providers,
          selectedProvider: stores.memos.selectedProvider,
        },
      },
      actions: {
        memos: {
          unsetExternalStorageProvider: {
            trigger: actions.memos.unsetExternalStorageProvider.trigger
          },
        },
      },
    });
  }
}
