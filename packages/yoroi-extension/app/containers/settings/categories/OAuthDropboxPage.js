// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { Navigate as Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { ExternalStorageList } from '../../../domain/ExternalStorage';

type Props = {|
  ...StoresAndActionsProps,
  match: {|
    params: {|
      token: string,
      token_type: string,
      uid: string,
      account_id: string,
    |}
  |},
|};

@observer
export default class OAuthDropboxPage extends Component<Props> {

  onLoad: string => Promise<void> = async (token) => {
    await this.props.actions.memos.updateExternalStorageProvider.trigger({
      provider: ExternalStorageList.DROPBOX,
      token,
    });
  };

  async componentDidMount() {
    const { token } = this.props.match.params;
    await this.onLoad(token);
  }

  render(): Node {
    // URL params
    return (
      <Redirect to="/settings/external-storage" />
    );
  }
}
