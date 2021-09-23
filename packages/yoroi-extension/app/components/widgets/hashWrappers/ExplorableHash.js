// @flow

import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './ExplorableHash.scss';
import { Tooltip, Typography } from '@mui/material';

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
  +placementTooltip?: string,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class ExplorableHash extends Component<Props> {
  static defaultProps: {|
    placementTooltip: string,
  |} = {
    placementTooltip: 'bottom',
  };

  render(): Node {
    const { websiteName, onExternalLinkClick } = this.props;

    const addressClass = classnames([this.props.light ? styles.lightColor : styles.darkColor]);
    return (
      <Tooltip
        className={styles.component}
        title={
          <Typography variant="tooltip">
            <FormattedMessage {...messages.websiteTip} values={{ websiteName }} />
          </Typography>
        }
        placement={this.props.placementTooltip}
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
