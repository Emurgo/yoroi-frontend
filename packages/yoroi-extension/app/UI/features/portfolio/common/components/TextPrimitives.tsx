// @ts-nocheck
import React from 'react';
import { Typography as MuiTypography } from '@mui/material';

const Typography = ({ children, ...props }) => <MuiTypography {...props}>{children}</MuiTypography>;

export default Typography;
