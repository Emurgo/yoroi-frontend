/* eslint-disable no-nested-ternary */
// @flow
import type { ElementRef, Node } from 'react';
import { IconButton, InputAdornment, TextField as TextFieldBase, useTheme } from '@mui/material';
import { ReactComponent as ErrorIcon }  from '../../assets/images/forms/error.inline.svg';
import { ReactComponent as DoneIcon }  from '../../assets/images/forms/done.inline.svg';
import { ReactComponent as EyeIcon }  from '../../assets/images/forms/password-eye-close.inline.svg';
import { ReactComponent as CloseEyeIcon }  from '../../assets/images/forms/password-eye.inline.svg';
import React from 'react';

type Props = {|
  error?: boolean | string,
  done?: boolean,
  type?: string,
  className?: string,
  value: any,
  disabled?: boolean,
  label?: string,
  InputLabelProps?: Object,
  onChange?: Function,
  onBlur?: Function,
  autoFocus?: boolean,
  inputRef?: ?{| current: null | ElementRef<'input'> |},
  revamp?: boolean,
  placeholder?: string,
|};

function TextField({
  label,
  value,
  disabled,
  error,
  done,
  type,
  inputRef,
  className,
  InputLabelProps,
  onBlur,
  onChange,
  autoFocus,
  revamp,
  ...props
}: Props): Node {
  const theme = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  return (
    <TextFieldBase
      className={className}
      error={Boolean(error)}
      label={!revamp && label}
      value={value}
      disabled={disabled}
      autoFocus={autoFocus}
      inputRef={inputRef}
      helperText={error}
      onBlur={onBlur}
      onChange={onChange}
      type={type !== 'password' ? type : showPassword ? 'text' : 'password'}
      variant={revamp === true ? 'standard' : 'outlined'}
      /*
        In order to show placeholders for classic theme we dont' need to override
        'shrink' and 'notched' prop status so we pass an empty object
      */
      InputLabelProps={
        theme.name === 'classic' ? { shrink: true, ...InputLabelProps } : { ...InputLabelProps }
      }
      InputProps={{
        ...(theme.name === 'classic' ? { notched: false } : {}),
        endAdornment:
          type === 'password' ? (
            <InputAdornment
              position="end"
              sx={{ minWidth: '52px', display: 'flex', justifyContent: 'flex-end' }}
            >
              {Boolean(error) === true ? <ErrorIcon /> : done === true ? <DoneIcon /> : null}
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <EyeIcon /> : <CloseEyeIcon />}
              </IconButton>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              {Boolean(error) === true ? <ErrorIcon /> : done === true ? <DoneIcon /> : null}
            </InputAdornment>
          ),
          disableUnderline: revamp,
          placeholder: revamp ? '0.0' : '',
      }}
      {...props}
    />
  );
}
TextField.defaultProps = {
  label: '',
  done: false,
  error: '',
  className: '',
  disabled: false,
  InputLabelProps: null,
  inputRef: null,
  onChange: null,
  onBlur: null,
  type: 'text',
  autoFocus: false,
  revamp: false,
};

export default TextField;
