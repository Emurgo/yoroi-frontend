// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Typography, Tooltip } from '@mui/material'
import { ReactComponent as InfoIcon }  from '../../assets/images/info-icon.inline.svg';
import styles from './CustomTooltip.scss';
import classnames from 'classnames';

type Props = {|
  +toolTip: Node,
  +children?: Node,
  +isPoolAvatar?: boolean,
  +placementTooltip?: string,
|};

@observer
export default class CustomTooltip extends Component<Props> {
  static defaultProps: {|
    children: void,
    isPoolAvatar: boolean,
    placementTooltip: string,
  |} = {
    children: undefined,
    isPoolAvatar: false,
    placementTooltip: 'top',
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
          title={<Typography component="div" variant="body3">{toolTip}</Typography>}
          placement="top"
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
