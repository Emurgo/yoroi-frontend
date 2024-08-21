/* eslint-disable no-nested-ternary */
// @flow
import React from 'react';
import type { ElementRef, Node } from 'react';
import { IconButton, InputAdornment, TextField as TextFieldBase, useTheme, styled } from '@mui/material';
import { ReactComponent as ErrorIcon } from '../../assets/images/forms/error.inline.svg';
import { ReactComponent as DoneIcon } from '../../assets/images/forms/done.inline.svg';
import { ReactComponent as EyeIcon } from '../../assets/images/forms/password-eye-close.inline.svg';
import { ReactComponent as CloseEyeIcon } from '../../assets/images/forms/password-eye.inline.svg';
import { ReactComponent as QRLogo } from '../../assets/images/qr-code.inline.svg';
import LoadingSpinner from '../widgets/LoadingSpinner';

type Props = {|
  error?: boolean | string,
  helperText?: string,
  done?: boolean,
  greenCheck?: boolean,
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
  QRHandler?: Function,
  isLoading?: boolean,
|};

const SIconButton = styled(IconButton)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

function TextField({
  label,
  value,
  disabled,
  error,
  helperText,
  done,
  greenCheck,
  type,
  inputRef,
  className,
  InputLabelProps,
  onBlur,
  onChange,
  autoFocus,
  revamp,
  QRHandler,
  placeholder,
  isLoading,
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

  const isRevampTheme = theme.name === 'revamp-light';

  return (
    <TextFieldBase
      className={className}
      error={Boolean(error)}
      label={!Boolean(revamp) && label}
      value={value}
      disabled={disabled}
      autoFocus={autoFocus}
      inputRef={inputRef}
      helperText={error || helperText}
      onBlur={onBlur}
      onChange={onChange}
      type={type !== 'password' ? type : showPassword ? 'text' : 'password'}
      variant={Boolean(revamp) ? 'standard' : 'outlined'}
      sx={{
        '& .MuiFormHelperText-root': {
          marginTop: '4px',
          letterSpacing: '0.2px',
        },
      }}
      /*
        In order to show placeholders for classic theme we dont' need to override
        'shrink' and 'notched' prop status so we pass an empty object
      */
      InputLabelProps={theme.name === 'classic' ? { shrink: true, ...InputLabelProps } : { ...InputLabelProps }}
      InputProps={{
        ...((Boolean(revamp) ? { disableUnderline: true } : {}): any),
        ...((theme.name === 'classic' ? { notched: false } : {}): any),
        sx: value.length === 0 ? { color: 'grayscale.900 !important' } : null,
        endAdornment: isLoading ? (
          <InputAdornment position="end" sx={{ marginTop: '-26px' }}>
            <LoadingSpinner small />
          </InputAdornment>
        ) : type === 'password' ? (
          <InputAdornment position="end" sx={{ minWidth: '52px', display: 'flex', justifyContent: 'flex-end' }}>
            {Boolean(error) === true && !isRevampTheme ? <ErrorIcon /> : done === true && !isRevampTheme ? <DoneIcon /> : null}
            <SIconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              sx={{
                width: '40px',
                height: '40px',
              }}
            >
              {showPassword ? <CloseEyeIcon /> : <EyeIcon />}
            </SIconButton>
          </InputAdornment>
        ) : QRHandler ? (
          <InputAdornment position="end" sx={{ minWidth: '52px', display: 'flex', justifyContent: 'flex-end' }}>
            {Boolean(error) === true && !isRevampTheme ? <ErrorIcon /> : done === true && !isRevampTheme ? <DoneIcon /> : null}
            <SIconButton aria-label="QR Code Scanner" onClick={QRHandler} edge="end">
              <QRLogo />
            </SIconButton>
          </InputAdornment>
        ) : (
          <InputAdornment position="end">
            {Boolean(error) === true && !isRevampTheme ? (
              <ErrorIcon id='input-error-icon'/>
            ) : (done === true && !isRevampTheme) || greenCheck ? (
              <DoneIcon id='input-done-icon'/>
            ) : null}
          </InputAdornment>
        ),
        placeholder: placeholder != null ? placeholder : '',
      }}
      {...props}
    />
  );
}
TextField.defaultProps = {
  label: '',
  done: false,
  greenCheck: false,
  error: '',
  helperText: ' ',
  className: '',
  disabled: false,
  InputLabelProps: null,
  inputRef: null,
  onChange: null,
  onBlur: null,
  type: 'text',
  autoFocus: false,
  revamp: false,
  QRHandler: null,
  placeholder: undefined,
  isLoading: false,
};

export default TextField;
