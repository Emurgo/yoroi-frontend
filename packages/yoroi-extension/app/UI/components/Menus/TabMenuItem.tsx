import React from 'react';
import { observer } from 'mobx-react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';

type Props = {
  label: string;
  active: boolean;
  onClick: () => void;
  className: string;
  disabled?: boolean;
  locationId: string;
};

const StyledButton = styled(Box, {
  shouldForwardProp: prop => prop !== 'active',
})<{ active: boolean }>(({ theme, active }: any) => ({
  display: 'block',
  textAlign: 'left',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '22px',
  padding: '6px 0px',
  borderBottom: '3px solid transparent',
  width: 'initial',
  marginRight: '24px',
  color: active ? theme.palette.ds.text_primary_medium : theme.palette.ds.text_gray_low,
  borderBottomColor: active ? theme.palette.ds.text_primary_medium : 'transparent',
  cursor: 'pointer',

  '&:hover': {
    color: active ? theme.palette.ds.text_primary_max : theme.palette.ds.text_gray_medium,
    borderBottomColor: active ? theme.palette.ds.text_primary_max : undefined,
  },

  '&:focus': {
    outlineColor: theme.palette.ds.sys_yellow_500,
    outlineWidth: '2px',
    outlineStyle: 'solid',
  },

  '&.Mui-disabled': {
    color: theme.palette.ds.text_gray_min,
    borderBottomColor: active ? theme.palette.ds.el_gray_min : 'transparent',
    cursor: 'default',
  },
}));

const TabMenuItem: React.FC<Props> = observer(({ label, active, disabled = false, onClick, className, locationId }) => {
  const stateClass = disabled ? 'disabled' : 'enabled';
  const componentClasses = classNames('component', stateClass, className);
  const componentClassesArr = componentClasses.split(' ');
  const lastClass = componentClassesArr[componentClassesArr.length - 1];
  const subMenuItemId = lastClass?.toLowerCase().replace(/[ \/]/gi, '');

  return (
    <StyledButton
      component="button"
      active={active}
      className={componentClasses}
      onClick={onClick}
      id={`${locationId}-${subMenuItemId}SubTab-button`}
    >
      <Typography variant="body1" fontWeight={500}>
        {label}
      </Typography>
    </StyledButton>
  );
});

export default TabMenuItem;
