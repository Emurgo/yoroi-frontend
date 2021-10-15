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
  labelSx?: Object,
  menuProps?: Object,
  helperText?: string,
  options: Array<Object>,
|};

function Select({
  label,
  labelId,
  onChange,
  helperText,
  formControlProps,
  labelSx,
  menuProps,
  shrink,
  disabled,
  ...props
}: Props): Node {
  return (
    <SFormControl fullWidth disabled={disabled} {...formControlProps}>
      <InputLabel
        sx={{
          color: 'var(--mui-input-text-color)',
          '&.Mui-focused': {
            color: 'var(--mui-input-text-color)',
          },
          ...(labelSx !== null && labelSx),
        }}
        shrink={shrink}
        id={labelId}
      >
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
      {helperText !== null ? (
        <FormHelperText
          sx={{
            position: 'absolute',
            marginLeft: 0,
            lineHeight: '1.33',
            fontSize: '12px',
            bottom: '-5px',
          }}
        >
          {helperText}
        </FormHelperText>
      ) : null}
    </SFormControl>
  );
}

export default Select;

Select.defaultProps = {
  formControlProps: null,
  labelSx: null,
  menuProps: null,
  helperText: null,
  shrink: true,
  disabled: false,
};

const SFormControl = styled(FormControl)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.name === 'classic' ? '24px' : 0,
  paddingBottom: '20px',
  '& .MuiOutlinedInput-root': {
    height: '50px',
    '& fieldset': {
      background: 'unset',
      borderColor: 'var(--mui-input-border-color)',
      borderRadius: theme.shape.borderRadius,
    },
  },
}));
