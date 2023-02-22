// @flow
import { Component } from 'react';
import type { Node } from 'react';
import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';

export default class CreateWalletPage extends Component<{||}> {
  render(): Node {
    return (
      <div>
        <h1>Create new wallet!!</h1>
        <SaveRecoveryPhraseTipsDialog open />
      </div>
    )
  }
}