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
          ...(labelSx !== null && labelSx),
        }}
        shrink={shrink}
        id={labelId}
      >
        {label}
      </InputLabel>
      <SelectBase
        color="gray"
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
            fontSize: '0.75rem',
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
  /* TODO: Unify label and fieldset styles in one place
  These styles came from overrides TextField */
  '&:hover': {
    '& .MuiInputLabel-root': {
      color: 'var(--component-input-text-focus)',
      '&.Mui-disabled': {
        color: 'var(--component-input-border-disabled)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--component-input-placeholder)',
    '&.Mui-focused': {
      color: 'var(--component-input-text-focus)',
    },
    '&.Mui-disabled': {
      color: 'var(--component-input-placeholder-disabled)',
    },
    '&.Mui-error': {
      color: 'var(--component-input-error)',
    },
  },
  '& .MuiOutlinedInput-root': {
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--component-input-border-focus)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--component-input-border)',
      backgroundColor: 'var(--component-input-background)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--component-input-border-focus)',
      border: '2px solid',
    },
    '& svg': {
      color: 'var(--component-input-border)',
    },
    '&.Mui-focused svg': {
      color: 'var(--component-input-helper-text)',
    },
    '&.Mui-disabled svg': {
      color: 'var(--component-input-border-disabled)',
    },
    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--component-input-border-disabled)',
      backgroundColor: 'var(--component-input-background-disabled)',
      color: 'var(--component-input-text-disabled)',
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--component-input-error)',
    },
  },
}));
