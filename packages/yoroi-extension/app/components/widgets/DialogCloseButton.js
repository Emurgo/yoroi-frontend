// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import { ReactComponent as CloseCross }  from '../../assets/images/cross-dark.inline.svg';
import { IconButton } from '@mui/material';

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
    const Svg = icon != null && icon !== '' ? icon : CloseCross;
    return (
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: '18px',
          right: '30px',
          marginLeft: '5px',
        }}
      >
        <Svg />
      </IconButton>
    );
  }
}
