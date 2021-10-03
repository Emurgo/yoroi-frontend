// @flow
import type { Node } from 'react';
import { FormControl, FormHelperText, InputLabel, Select as SelectBase } from '@mui/material';
import { styled } from '@mui/system';
import ArrowIcon from '../../assets/images/forms/arrow-dropdown.inline.svg';

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
  ...props
}: Props): Node {
  return (
    <SFormControl fullWidth disabled={disabled} {...formControlProps}>
      <InputLabel shrink={shrink} id={labelId} {...labelProps}>
        {label}
      </InputLabel>
      <SelectBase
        labelId={labelId}
        IconComponent={ArrowIcon}
        label={label}
        onChange={e => onChange(e.target.value)}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          ...(menuProps !== null && menuProps),
        }}
        {...props}
      />
      {helperText !== null ? <FormHelperText>{helperText}</FormHelperText> : null}
    </SFormControl>
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

const SFormControl = styled(FormControl)({
  position: 'relative',
  paddingBottom: '20px',
  '&:hover': {
    '& .MuiInputLabel-root': {
      color: 'var(--component-input-text-focus)',
      '&.Mui-disabled': {
        color: 'var(--component-input-border-disabled)',
      },
      '&.Mui-error': {
        color: 'var(--component-input-error)',
      },
    },
  },
});
