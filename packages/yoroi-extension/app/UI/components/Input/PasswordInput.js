// @flow

import React from 'react';
import type { Node } from 'react';
import { styled } from '@mui/material/styles';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import { Icon } from '../icons/index';
import { VisibilityOff } from '../icons/VisibilityOff';
import { VisibilityOn } from '../icons/VisibilityOn';

type StyledInputProps = {|
  id: string,
  label: string,
  variant?: string,
  onChange: (event: any) => void,
  value?: string,
  error?: boolean,
  helperText?: string,
|};

export const PasswordInput = ({
  id,
  label,
  variant,
  onChange,
  value,
  error,
  helperText,
}: StyledInputProps): Node => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  return (
    <FormControl variant="outlined">
      <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
      <SOutlinedInput
        fullWidth
        id={id}
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        onChange={onChange}
        value={value}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <Icon.VisibilityOff /> : <Icon.VisibilityOn />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
      />
    </FormControl>
  );
};

const SOutlinedInput = styled(OutlinedInput)(({ theme, error }) => ({
  // additional styles here
}));
