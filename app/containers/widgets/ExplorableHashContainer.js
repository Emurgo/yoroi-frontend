// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../utils/routing';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { ExplorerType, LinkType } from '../../domain/Explorer';
import { Explorer, explorerInfo } from '../../domain/Explorer';

import ExplorableHash from '../../components/widgets/hashWrappers/ExplorableHash';

type Props = {|
  +children: ?Node,
  +selectedExplorer: ExplorerType,
  +hash: string,
  +light: boolean,
  +linkType: LinkType,
  +tooltipOpensUpward?: boolean,
|};

@observer
export default class ExplorableHashContainer extends Component<Props> {
  static defaultProps = {
    tooltipOpensUpward: false,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;

    let explorer = explorerInfo[this.props.selectedExplorer];

    // since not every explorer supports every feature
    // we default to Seiza if the link type doesn't exist for the selected explorer
    let baseUrl = explorer[this.props.linkType];
    if (!baseUrl) {
      explorer = explorerInfo.seiza;
      baseUrl = explorer[this.props.linkType];
    }

    /**
     * We only add "blockchain explorer" after the name for Seiza
     * this is because Seiza is the default so the user may not know
     * that Seiza is a blockchain explorer.
     * If they've switched from the default, they should know what the names mean
     */
    const name = this.props.selectedExplorer === Explorer.SEIZA
      ? explorer.name + ' ' + intl.formatMessage(globalMessages.blockchainExplorer)
      : explorer.name;

    return (
      <ExplorableHash
        websiteName={name}
        url={baseUrl + this.props.hash}
        light={this.props.light}
        onExternalLinkClick={handleExternalLinkClick}
        tooltipOpensUpward={this.props.tooltipOpensUpward}
      >
        {this.props.children}
      </ExplorableHash>
    );
  }

}
