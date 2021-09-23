/* eslint-disable no-nested-ternary */
// @flow
import type { Node } from 'react';
import { IconButton, InputAdornment, TextField as TextFieldBase } from '@mui/material';
import ErrorIcon from '../../assets/images/forms/error.inline.svg';
import DoneIcon from '../../assets/images/forms/done.inline.svg';
import { styled } from '@mui/system';
import EyeIcon from '../../assets/images/forms/password-eye-close.inline.svg';
import CloseEyeIcon from '../../assets/images/forms/password-eye.inline.svg';
import React from 'react';

type Props = {|
  error?: boolean | string,
  done?: boolean,
  type: string,
  className?: string,
  value: any,
  disabled?: boolean,
  label?: string,
|};

export default function TextField({
  label,
  value,
  disabled,
  error,
  done,
  type,
  className,
  ...props
}: Props): Node {
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  const handleMouseDownPassword = event => {
    event.preventDefault();
  };
  return (
    <STextField
      fullWidth
      className={className}
      error={Boolean(error)}
      label={label}
      value={value}
      disabled={disabled}
      type={type !== 'password' ? type : showPassword ? 'text' : 'password'}
      InputProps={{
        endAdornment:
          type === 'password' ? (
            <InputAdornment
              position="end"
              sx={{ minWidth: '52px', display: 'flex', justifyContent: 'flex-end' }}
            >
              {error !== null && error === true ? (
                <ErrorIcon />
              ) : done !== null && done === true ? (
                <DoneIcon />
              ) : null}
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
              {error !== null && error === true ? (
                <ErrorIcon />
              ) : done !== null && done === true ? (
                <DoneIcon />
              ) : null}
            </InputAdornment>
          ),
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
};
const STextField = styled(TextFieldBase)(({ theme }) => ({
  paddingBottom: 20,
  marginTop: theme.name === 'classic' ? 0 : 10,
  marginBottom: 10,
}));
