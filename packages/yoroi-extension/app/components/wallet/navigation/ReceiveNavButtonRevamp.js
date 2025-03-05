// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { Box, Typography, styled } from '@mui/material';

type Props = {|
  +label: string,
  +isActive: boolean,
  +onClick: void => void,
  +className?: string,
  +icon?: string,
  +isToplevel?: boolean,
  +noGutters?: boolean,
  +sx?: Object,
  +tooltip?: Node,
|};

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.sys_magenta_500,
    },
  },
}));

@observer
export default class ReceiveNavButtonRevamp extends Component<Props> {
  static defaultProps: {|
    className: void,
    icon: void,
    isToplevel: void,
    noGutters: boolean,
    sx: Object,
    tooltip: void,
  |} = {
    className: undefined,
    icon: undefined,
    isToplevel: undefined,
    noGutters: false,
    sx: {},
    tooltip: undefined,
  };

  renderButton: void => Node = () => {
    const isTopLvl = Boolean(this.props.isToplevel);
    const isActive = Boolean(this.props.isActive);
    const locationId = 'wallet:receive:navigationPanel';
    const simplifiedLabel = this.props.label.toLowerCase().replace(/[ \/]/gi, '');
    return (
      <Box
        onClick={this.props.onClick}
        color={isTopLvl && isActive ? 'primary.600' : 'grayscale.600'}
        id={locationId + '-' + simplifiedLabel + 'MenuItem-button'}
      >
        <Box display="flex" alignItems="center" gap="6px">
          <Typography component="div" variant="body1" fontWeight={this.props.isActive ? 500 : 400}>
            {this.props.label}
          </Typography>
          <Box component="span">
            {this.props.tooltip}
          </Box>
        </Box>
      </Box>
    );
  };

  render(): Node {
    const IconComponent = this.props.icon;
    const isTopLvl = Boolean(this.props.isToplevel);
    const noGutters = Boolean(this.props.noGutters);

    const paddings = noGutters
      ? {}
      : {
          pr: '24px',
          pb: isTopLvl ? '24px' : '16px',
          pl: isTopLvl ? '24px' : '52px',
        };

    return (
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...paddings,
          ...this.props.sx,
          background: 'ds.bg_color_max',
        }}
        className={this.props.className}
      >
        {this.renderButton()}
        {IconComponent != null && (
          <IconWrapper>
            <IconComponent />
          </IconWrapper>
        )}
      </Box>
    );
  }
}
