// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import Tooltip from '../common/Tooltip'
import { Typography } from '@mui/material'
import InfoIcon from '../../assets/images/info-icon.inline.svg';
import styles from './CustomTooltip.scss';
import classnames from 'classnames';

type Props = {|
  +toolTip: Node,
  +children?: Node,
  +isOpeningUpward?: boolean,
  +isPoolAvatar?: boolean,
|};

@observer
export default class CustomTooltip extends Component<Props> {
  static defaultProps: {|
    children: void,
    isOpeningUpward: boolean,
    isPoolAvatar: boolean,
  |} = {
    children: undefined,
    isOpeningUpward: true,
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
          title={<Typography variant="tooltip">{toolTip}</Typography>}
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
