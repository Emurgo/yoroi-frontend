// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../utils/routing';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { LinkType } from '../../api/ada/lib/storage/database/explorers/tables';
import { SelectedExplorer } from '../../domain/SelectedExplorer';

import ExplorableHash from '../../components/widgets/hashWrappers/ExplorableHash';

type Props = {|
  +children: ?Node,
  +selectedExplorer: SelectedExplorer,
  +hash: string,
  +light?: boolean,
  +primary?: boolean,
  +linkType: LinkType,
  +placementTooltip?: string,
|};

@observer
export default class ExplorableHashContainer extends Component<Props> {
  static defaultProps: {|
    placementTooltip: string,
    primary: boolean,
    light?: boolean,
  |} = {
    placementTooltip: 'bottom',
    primary: false,
    light: undefined,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;

    const explorerInfo = this.props.selectedExplorer.getOrDefault(this.props.linkType);
    if (explorerInfo == null) {
      return this.props.children ?? null;
    }

    const displayName =
      explorerInfo.name + ' ' + intl.formatMessage(globalMessages.blockchainExplorer);

    return (
      <ExplorableHash
        websiteName={displayName}
        url={explorerInfo.baseUrl + this.props.hash}
        light={this.props.light}
        primary={this.props.primary}
        onExternalLinkClick={handleExternalLinkClick}
        placementTooltip={this.props.placementTooltip}
      >
        {this.props.children}
      </ExplorableHash>
    );
  }
}
