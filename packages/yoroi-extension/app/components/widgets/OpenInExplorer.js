// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './OpenInExplorer.scss';

type Props = {|
  +children?: Node,
  +network: $ReadOnly<NetworkRow>,
  +address: string,
|};

@observer
export default class OpenInExplorer extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children, network, address } = this.props;
    return (
      <a href='http://google.com' rel="noreferrer"  target='_blank'>{children} {network.NetworkId}</a>
    );
  }
}
