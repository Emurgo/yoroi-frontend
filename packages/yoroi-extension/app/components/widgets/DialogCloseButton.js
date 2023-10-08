// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import { ReactComponent as CloseCross } from '../../assets/images/cross-dark.inline.svg';
import { ReactComponent as CloseCrossRevamp } from '../../assets/images/cross-dark-revamp.inline.svg';
import { IconButton } from '@mui/material';

type Props = {|
  +onClose?: void => PossiblyAsync<void>,
  +icon?: ?string,
  +revamp?: boolean,
|};

@observer
export default class DialogCloseButton extends Component<Props> {
  static defaultProps: {| icon: null, onClose: void, revamp: void |} = {
    onClose: undefined,
    icon: null,
    revamp: undefined,
  };

  render(): Node {
    const { onClose, icon, revamp } = this.props;
    const defaultIcon = revamp ? CloseCrossRevamp : CloseCross;
    const Svg = icon != null && icon !== '' ? icon : defaultIcon;
    return (
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: revamp ? '15px' : '18px',
          right: revamp ? '12px' : '30px',
          marginLeft: '5px',
        }}
      >
        <Svg />
      </IconButton>
    );
  }
}
