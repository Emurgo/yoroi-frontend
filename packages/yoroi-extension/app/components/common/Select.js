// @flow
import * as React from 'react'
import type { Node } from 'react';
import { FormControl, FormHelperText, InputLabel, Select as SelectBase, useTheme } from '@mui/material';
import { ReactComponent as ArrowIcon } from '../../assets/images/forms/arrow-dropdown.inline.svg';
import { ReactComponent as ArrowIconDT } from '../../assets/images/forms/arrow-drowdown-dark-theme.inline.svg';

type Props = {|
  label: string,
  labelId: string,
  onChange: Event => void,
  formControlProps?: Object,
  shrink?: boolean,
  disabled?: boolean,
  menuProps?: Object,
  labelProps?: Object,
  helperText?: string,
  options: Array<Object>,
  maxHeight?: string,
|};

function Select({
  label,
  labelId,
  onChange,
  helperText,
  formControlProps,
  menuProps,
  shrink,
  disabled,
  labelProps,
  maxHeight,
  ...props
}: Props): Node {
  const theme = useTheme();
  const isDark = theme.name === 'dark-theme';
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const formControlId = `${labelId}-selectForm-component`;
  const inputLabelId = `${labelId}-inputLabel-text`;
  const selectId = `${labelId}-select-component`;
  return (
    <FormControl disabled={disabled} {...formControlProps} id={formControlId}>
      <InputLabel shrink={shrink} id={inputLabelId} {...labelProps}>
        {label}
      </InputLabel>
      <SelectBase
        labelId={selectId}
        IconComponent={isDark ? ArrowIconDT : ArrowIcon}
        label={label}
        onChange={e => onChange(e.target.value)}
        onClose={handleClose}
        onOpen={handleOpen}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          sx: {
            '& .MuiMenu-paper': {
              maxHeight: maxHeight != null ? maxHeight : '500px',
              borderRadius: '8px',
              boxShadow: open ? theme.palette.ds.light_shadow_dropdown_menu : 'unset',
            },
          },
          ...(menuProps !== null && menuProps),
        }}
        {...props}
      />
      {helperText !== null ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}

export default Select;

Select.defaultProps = {
  formControlProps: null,
  menuProps: null,
  labelProps: null,
  helperText: null,
  shrink: true,
  disabled: false,
};
