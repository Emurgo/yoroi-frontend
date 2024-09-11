import { styled } from '@mui/material/styles';
import React from 'react';

import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Icon } from '../icons/index';

type StyledInputProps = {
  id: string;
  label: string;
  variant?: string;
  onChange: (event: any) => void;
  value?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

export const PasswordInput = ({ id, label, onChange, value, error, disabled, helperText }: StyledInputProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  return (
    <SFormControl variant="outlined">
      <InputLabel htmlFor="outlined-adornment-password" error={error}>
        {label}
      </InputLabel>
      <SOutlinedInput
        fullWidth
        id={id}
        type={showPassword ? 'text' : 'password'}
        onChange={onChange}
        value={value}
        disabled={disabled}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {!showPassword ? <Icon.VisibilityOff /> : <Icon.VisibilityOn />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
        error={error}
      />
      {error && (
        <FormHelperText error id="labe-error">
          {helperText}
        </FormHelperText>
      )}
    </SFormControl>
  );
};

const SOutlinedInput = styled(OutlinedInput)(({ theme, error }: any) => ({
  '& .MuiFormHelperText-root': {
    marginLeft: '0px',
  },

  '& .MuiFormLabel-root': {
    color: error && theme.palette.ds.sys_magenta_500,
  },
}));
const SFormControl = styled(FormControl)(({ theme, error }: any) => ({
  '& .MuiFormHelperText-root': {
    marginLeft: '0px',
  },

  '& .MuiFormLabel-root': {
    color: error && theme.palette.ds.sys_magenta_500,
  },
}));
