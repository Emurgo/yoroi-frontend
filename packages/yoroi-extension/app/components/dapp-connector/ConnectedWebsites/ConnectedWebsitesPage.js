// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

type Props = {|
    +onCreate: void => void,
    +onRestore: void => void,
    +onHardwareConnect: void => void,
|};

@observer
export default class ConnectedWebsitesPage extends Component<Props> {

    render(): Node {
        return <h1>Connected websites</h1>
    }
}