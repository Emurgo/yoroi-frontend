// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../utils/routing';

import ExplorableHash from '../../components/widgets/hashWrappers/ExplorableHash';

export type LinkType = 'address' | 'transaction';
export type ExplorerName = 'seiza';

type Props = {|
  children: ?Node,
  hash: string,
  light: boolean,
  linkType: LinkType,
  tooltipOpensUpward?: boolean,
|};

type Explorer = {
  name: string,
  address: string,
  transaction: string,
}
const explorerInfo: { [key: ExplorerName]: Explorer } = {
  seiza: {
    name: 'Seiza Blockchain Explorer',
    address: 'https://seiza.com/blockchain/address/',
    transaction: 'https://seiza.com/blockchain/transaction/',
  }
};

@observer
export default class ExplorableHashContainer extends Component<Props> {
  static defaultProps = {
    tooltipOpensUpward: false,
  };

  render() {
    const explorer = explorerInfo.seiza;
    return (
      <ExplorableHash
        websiteName={explorer.name}
        url={explorer[this.props.linkType] + this.props.hash}
        light={this.props.light}
        onExternalLinkClick={handleExternalLinkClick}
        tooltipOpensUpward={this.props.tooltipOpensUpward}
      >
        {this.props.children}
      </ExplorableHash>
    );
  }

}
