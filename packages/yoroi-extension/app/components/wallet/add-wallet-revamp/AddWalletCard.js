// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';

type Props = {|
    label: string,
    imageSrc: string,
|};

export default class AddWalletCard extends Component<Props> {
    render(): Node {
        const { label, imageSrc } = this.props;
        return (
          <Box
            sx={{
                background: 'linear-gradient(180deg, #E4E8F7 0%, #C6F7F7 100%)',
                borderRadius: '8px',
                padding: '16px',
                width: '312px',
                height: '440px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                '&::before': {
                  position: 'absolute',
                  content: '""',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  background: 'linear-gradient(180deg, #93F5E1 0%, #C6F7ED 100%)',
                  borderRadius: '8px',
                  zIndex: -1,
                  transition: 'opacity 300ms linear',
                  opacity: 0,
                },
                '&:hover::before': {
                    opacity: 1,
                }
            }}
          >
            <Box>
              <img src={imageSrc} alt={label} />
            </Box>
            <Typography variant='h3' textAlign='center' padding='0px 40px' mt='16px'>{label}</Typography>
          </Box>
        )
    }
}