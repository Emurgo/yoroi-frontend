// @flow
import * as React from 'react';
import { observer } from 'mobx-react';
import { ReactComponent as CloseCrossRevamp } from '../../assets/images/cross-dark-revamp.inline.svg';
import { IconButton, styled } from '@mui/material';

export type Props = {|
  +onClose?: () => mixed | Promise<mixed>,
  +icon?: React$ComponentType<*> | string,
  +active?: boolean,
|};


function DialogCloseButton(props: Props): React.Node {
  const { onClose, icon, active = false } = props;

  const IconElement =
    icon && typeof icon !== 'string' ? (
      React.createElement(icon)
    ) : (
      <CloseCrossRevamp />
    );

  return (
    <SIconBtn
      aria-label="close dialog"
      onClick={onClose}
      active={active}
      size="small"
      sx={{ position: 'relative' }}
    >
      {typeof icon === 'string' ? <img src={icon} alt="close" /> : IconElement}
    </SIconBtn>
  );
}

const SIconBtn = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
  backgroundColor: active ? theme.palette.ds.gray_200 : 'transparent',
  '& svg path': {
    fill: theme.palette.ds.el_gray_medium,
  },
}));

export default observer(DialogCloseButton);