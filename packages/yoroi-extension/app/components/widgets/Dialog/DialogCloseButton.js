// @flow
import type { ComponentType, Node } from 'react';
import type { InjectedLayoutProps } from '../../../styles/context/layout';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { ReactComponent as CloseCross } from '../../../assets/images/cross-dark.inline.svg';
import { ReactComponent as CloseCrossRevamp } from '../../../assets/images/cross-dark-revamp.inline.svg';
import { IconButton } from '@mui/material';
import { withLayout } from '../../../styles/context/layout';

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
      <IconButton onClick={onClose} sx={{ position: 'relative', color: 'ds.gray_cmax' }}>
        <Svg />
      </IconButton>
    );
  }
}

export default (withLayout(DialogCloseButton): ComponentType<Props>);
