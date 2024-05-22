// @flow

import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { defineMessages, FormattedMessage } from 'react-intl';
import styles from './ExplorableHash.scss';
import { Box, Tooltip, Typography } from '@mui/material';

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
  +light?: boolean,
  +primary?: boolean,
  +placementTooltip?: string,
  +onExternalLinkClick: MouseEvent => void,
|};

@observer
export default class ExplorableHash extends Component<Props> {
  static defaultProps: {|
    placementTooltip: string,
    primary: boolean,
    light?: boolean,
  |} = {
    placementTooltip: 'bottom',
    primary: false,
    light: undefined,
  };

  render(): Node {
    const { websiteName, onExternalLinkClick } = this.props;
    const addressClass = classnames([this.props.light ? styles.lightColor : styles.darkColor]);

    return (
      <Tooltip
        className={styles.component}
        title={
          <Typography component="div" variant="body3">
            <FormattedMessage {...messages.websiteTip} values={{ websiteName }} />
          </Typography>
        }
        placement={this.props.placementTooltip}
      >
        {this.props.primary ? (
          <Box
            component="a"
            href={this.props.url}
            onClick={event => onExternalLinkClick(event)}
            sx={{
              borderRadius: '2px',
              color: 'transparent',
              '&:hover': {
                color: 'primary.600',
              },
              '&:active': {
                color: 'primary.700',
              },
              '&:focus': {
                color: 'primary.600',
                outlineWidth: '2px',
                outlineStyle: 'solid',
                outlineColor: theme => theme.palette.yellow[500],
              },
              '&:disabled': {
                color: 'primary.300',
              },
            }}
          >
            {this.props.children}
          </Box>
        ) : (
          <a
            className={styles.url}
            href={this.props.url}
            onClick={event => onExternalLinkClick(event)}
          >
            <span className={addressClass}>{this.props.children}</span>
          </a>
        )}
      </Tooltip>
    );
  }
}
