// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../utils/routing';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { ExplorerType, LinkType } from '../../domain/Explorer';
import { Explorer, getOrDefault, } from '../../domain/Explorer';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

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
  static defaultProps: {|tooltipOpensUpward: boolean|} = {
    tooltipOpensUpward: false,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const { name, baseUrl } = getOrDefault(this.props.selectedExplorer, this.props.linkType);

    /**
     * We only add "blockchain explorer" after the name for Seiza
     * this is because Seiza is the default so the user may not know
     * that Seiza is a blockchain explorer.
     * If they've switched from the default, they should know what the names mean
     */
    const displayName = this.props.selectedExplorer === Explorer.SEIZA
      ? name + ' ' + intl.formatMessage(globalMessages.blockchainExplorer)
      : name;

    return (
      <ExplorableHash
        websiteName={displayName}
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
