import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

type IllustrationCardProps = {
  illustration: string | React.ReactNode;
  title?: string;
  content?: string | React.ReactNode;
};

export const IllustrationCard = ({
  illustration = 'Illustration',
  title = 'Card Title',
  content = 'Card Content',
}: IllustrationCardProps) => {
  const theme = useTheme();
  return (
    <Stack
      sx={{
        // @ts-ignore
        background: theme.palette.ds.bg_gradient_1,
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        p: '16px',
        py: '32px',
      }}
      alignItems="center"
      justifyContent="center"
      width="100%"
      minHeight="352px"
      direction="column"
      gap="16px"
    >
      <Box>{illustration}</Box>
      <Box>
        <Typography
          component="div"
          variant="h3"
          color="grayscale.max"
          fontWeight={500}
          textAlign="center"
          padding="0px 40px"
          mb="4px"
        >
          {title}
        </Typography>
        {typeof content === 'string' ? (
          <Typography component="div" variant="body2" textAlign="center" color="grayscale.900">
            {content}
          </Typography>
        ) : (
          content
        )}
      </Box>
    </Stack>
  );
};
