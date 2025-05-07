import { Stack, styled } from '@mui/material';
import React from 'react';
import { TopBarActions } from './TopBarActions';

export const AssetSwap = () => {
  return (
    <Content direction="column" width="503px" margin="0 auto">
      <TopBarActions />
    </Content>
  );
};

const Content = styled(Stack)(({ theme }) => ({
  marginTop: '24px',
  width: '503px',
  margin: '0 auto',
}));
