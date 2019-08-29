// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class OauthDropboxPage extends Component<InjectedProps> {

  render() {
    return (<div><p>Dropbox</p></div>);
  }
}
