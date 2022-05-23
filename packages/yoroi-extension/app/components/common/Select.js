// @flow
import type { Node } from 'react';
import { FormControl, FormHelperText, InputLabel, Select as SelectBase } from '@mui/material';
import { ReactComponent as ArrowIcon }  from '../../assets/images/forms/arrow-dropdown.inline.svg';

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
    <FormControl disabled={disabled} {...formControlProps}>
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
