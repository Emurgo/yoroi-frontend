// @flow

import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './ExplorableHash.scss';

import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';

const messages = defineMessages({
  websiteTip: {
    id: 'widgets.explorer.tooltip',
    defaultMessage: '!!!Go to {websiteName}',
  },
});

type Props = {|
  +children: ?Node,
  +websiteName: string,
  +url: string,
  +light: boolean,
  +tooltipOpensUpward?: boolean,
  +onExternalLinkClick: MouseEvent => void,
  +arrowRelativeToTip?: boolean,
|};

@observer
export default class ExplorableHash extends Component<Props> {
  static defaultProps = {
    tooltipOpensUpward: false,
    arrowRelativeToTip: true,
  };

  render() {
    const { websiteName, onExternalLinkClick } = this.props;

    const addressClass = classnames([
      this.props.light ? styles.lightColor : styles.darkColor
    ]);
    return (
      <Tooltip
        className={styles.component}
        skin={TooltipSkin}
        isOpeningUpward={this.props.tooltipOpensUpward}
        arrowRelativeToTip={this.props.arrowRelativeToTip}
        tip={<FormattedMessage {...messages.websiteTip} values={{ websiteName }} />}
      >
        <a
          className={styles.url}
          href={this.props.url}
          onClick={event => onExternalLinkClick(event)}
        >
          <span className={addressClass}>{this.props.children}</span>
        </a>
      </Tooltip>
    );
  }
}
