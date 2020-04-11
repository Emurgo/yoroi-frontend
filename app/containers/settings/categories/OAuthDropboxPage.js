// @flow
import React, { Component } from 'react';
import { computed } from 'mobx';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import { ExternalStorageList } from '../../../domain/ExternalStorage';

type UrlProps = {|
  match: {|
    params: {|
      token: string,
      token_type: string,
      uid: string,
      account_id: string,
    |}
  |}
|}

type GeneratedData = typeof OAuthDropboxPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  ...UrlProps,
|};

@observer
export default class OAuthDropboxPage extends Component<Props> {

  onLoad: string => void = (token) => {
    this.generated.actions.memos.updateExternalStorageProvider.trigger({
      provider: ExternalStorageList.DROPBOX,
      token,
    });
  };

  render() {
    // URL params
    const { token } = this.props.match.params;
    this.onLoad(token);
    return (
      <Redirect to="/settings/external-storage" />
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(OAuthDropboxPage)} no way to generated props`);
    }
    const { actions } = this.props;
    return Object.freeze({
      actions: {
        memos: {
          updateExternalStorageProvider: {
            trigger: actions.memos.updateExternalStorageProvider.trigger
          },
        },
      },
    });
  }
}
