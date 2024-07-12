// @flow
import { Component } from 'react';
import type { ComponentType, Node } from 'react';
import { observer } from 'mobx-react';

import { ReactComponent as CloseCross } from '../../assets/images/cross-dark.inline.svg';
import { ReactComponent as CloseCrossRevamp } from '../../assets/images/cross-dark-revamp.inline.svg';
import { IconButton } from '@mui/material';
import { withLayout } from '../../styles/context/layout';
import type { InjectedLayoutProps } from '../../styles/context/layout';
import { styled } from '@mui/material';

type Props = {|
  +onClose?: void => PossiblyAsync<void>,
  +icon?: ?string,
  +isRevampLayout?: boolean,
|};

@observer
class DialogCloseButton extends Component<Props & InjectedLayoutProps> {
  static defaultProps: {| icon: null, onClose: void |} = {
    onClose: undefined,
    icon: null,
  };

  render(): Node {
    const { onClose, icon, isRevampLayout } = this.props;
    const defaultIcon = isRevampLayout ? CloseCrossRevamp : CloseCross;
    const Svg = icon != null && icon !== '' ? icon : defaultIcon;

    return (
      <SIconBtn onClick={onClose} sx={{ position: 'relative' }}>
        <Svg />
      </SIconBtn>
    );
  }
}

const SIconBtn = styled(IconButton)(({ theme, active }) => ({
  backgroundColor: active && theme.palette.ds.gray_c200,
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_normal,
    },
  },
}));

export default (withLayout(DialogCloseButton): ComponentType<Props>);
