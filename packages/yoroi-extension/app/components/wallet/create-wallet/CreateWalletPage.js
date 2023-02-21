// @flow
import { Component } from 'react';
import type { Node } from 'react';
import InfoDialog from '../../widgets/infoDialog';

export default class CreateWalletPage extends Component<{||}> {
    render(): Node {
        return (
          <div>
            <h1>Create new wallet!!</h1>
            <InfoDialog open>
                <h1>Hello, World</h1>
            </InfoDialog>
          </div>
        )
    }
}