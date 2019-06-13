// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../utils/routing';

import ExplorableHash from '../../components/widgets/hashWrappers/ExplorableHash';

type Props = {|
  children: ?Node,
  hash: string,
  light: boolean,
  tooltipOpensUpward?: boolean,
|};

@observer
export default class ExplorableHashContainer extends Component<Props> {
  static defaultProps = {
    tooltipOpensUpward: false,
  };

  render() {
    const seizaAddress = 'https://seiza.com/blockchain/address/';
    return (
      <ExplorableHash
        explorerName="Seiza"
        url={seizaAddress + this.props.hash}
        light={this.props.light}
        onExternalLinkClick={handleExternalLinkClick}
        tooltipOpensUpward={this.props.tooltipOpensUpward}
      >
        {this.props.children}
      </ExplorableHash>
    );
  }

}
