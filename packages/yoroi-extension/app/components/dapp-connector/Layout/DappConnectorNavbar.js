//@flow 
import { Component } from 'react';
import { observer } from 'mobx-react';

type Props = {|

|}

@observer
export default class DappConnectorNavbar extends Component<Props> {

    render() {
        return <h1>Dapp Connector!!</h1>
    }
}