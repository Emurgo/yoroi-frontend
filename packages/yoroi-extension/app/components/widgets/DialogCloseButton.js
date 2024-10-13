// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { ReactComponent as CloseCrossRevamp } from '../../assets/images/cross-dark-revamp.inline.svg';
import { IconButton, styled } from '@mui/material';

type Props = {|
  +onClose?: void => PossiblyAsync<void>,
  +icon?: ?string,
|};

@observer
export default class DialogCloseButton extends Component<Props> {
  static defaultProps: {| icon: null, onClose: void |} = {
    onClose: undefined,
    icon: null,
  };

  render(): Node {
    const { onClose, icon } = this.props;
    const Svg = icon != null && icon !== '' ? icon : CloseCrossRevamp;

    return (
      <SIconBtn onClick={onClose} sx={{ position: 'relative' }}>
        <Svg />
      </SIconBtn>
    );
  }
}

const SIconBtn = styled(IconButton)(({ theme, active }) => ({
  backgroundColor: active && theme.palette.ds.gray_200,
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
