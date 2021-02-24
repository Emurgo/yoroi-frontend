// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Tooltip } from 'react-polymorph/lib/components/Tooltip';
import { TooltipSkin } from 'react-polymorph/lib/skins/simple/TooltipSkin';
import InfoIcon from '../../assets/images/info-icon.inline.svg';
import styles from './CustomTooltip.scss';
import classnames from 'classnames';

type Props = {|
  +toolTip: Node,
  +children?: Node,
  +isAligningRight?: boolean,
  +isOpeningUpward?: boolean,
  +isPoolAvatar?: boolean,
|};

@observer
export default class CustomTooltip extends Component<Props> {
  static defaultProps: {|
    children: void,
    isOpeningUpward: boolean,
    isAligningRight: boolean,
    isPoolAvatar: boolean,
  |} = {
    children: undefined,
    isOpeningUpward: true,
    isAligningRight: false,
    isPoolAvatar: false,
  }

  render(): Node {
    const { toolTip, children } = this.props;
    const child = (children == null) ? this.makeDefaultChild() : children;

    return (
      <div className={classnames([
        styles.component,
        this.props.isPoolAvatar === true
          ? styles.PoolAvatarTooltip
          : null
        ])}
      >
        <Tooltip
          className={classnames([
            this.props.isAligningRight === true
              ? null
              : styles.SimpleCenteredTooltip,
          ])}
          skin={TooltipSkin}
          isAligningRight={this.props.isAligningRight}
          tip={toolTip}
          isOpeningUpward={this.props.isOpeningUpward}
        >
          <span className={styles.infoIcon}>
            {child}
          </span>
        </Tooltip>
      </div>
    );
  }

  makeDefaultChild: (() => Node) = () => {
    return (
      <InfoIcon width="14" height="14" />
    );
  }
}
