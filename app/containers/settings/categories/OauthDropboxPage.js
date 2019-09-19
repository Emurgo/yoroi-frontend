// @flow
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../../../types/injectedPropsType';
import { ExternalStorageList } from '../../../domain/ExternalStorage';

type UrlProps = {
  match: {
    params: {
      token: string,
      token_type: string,
      uid: string,
      account_id: string,
    }
  }
}

@observer
export default class OAuthDropboxPage extends Component<InjectedProps & UrlProps> {

  onLoad = (token: string) => {
    this.props.actions.memos.updateExternalStorageProvider.trigger({
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
}
