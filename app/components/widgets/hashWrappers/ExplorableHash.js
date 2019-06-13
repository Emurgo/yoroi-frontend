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
  explorerTip: {
    id: 'widgets.explorer.tooltip',
    defaultMessage: '!!!Go to {explorerName} Blockchain Explorer',
  },
});

type Props = {|
  children: ?Node,
  explorerName: string,
  url: string,
  light: boolean,
  tooltipOpensUpward?: boolean,
  onExternalLinkClick: Function,
|};

@observer
export default class ExplorableHash extends Component<Props> {
  static defaultProps = {
    tooltipOpensUpward: false,
  };

  render() {
    const { explorerName, onExternalLinkClick } = this.props;

    const addressClass = classnames([
      this.props.light ? styles.lightColor : styles.darkColor
    ]);
    return (
      <Tooltip
        className={styles.component}
        skin={TooltipSkin}
        isOpeningUpward={this.props.tooltipOpensUpward}
        arrowRelativeToTip
        tip={<FormattedMessage {...messages.explorerTip} values={{ explorerName }} />}
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
