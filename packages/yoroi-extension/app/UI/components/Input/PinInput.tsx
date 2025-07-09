import { Box, Stack, Typography } from '@mui/material';

type Props = {
  value: string;
  onChange?: (value: string) => void;
  length: number;
};

export const PinInput = ({ value, length }: Props) => {
  return (
    <Stack direction="row" gap="24px" width="100%" justifyContent="center" alignItems="center">
      {value.split('', length).map((pin, index) => (
        <Box
          key={index}
          sx={{
            width: '56px',
            height: '56px',
            border: '1px solid',
            borderColor: 'ds.gray_400',
            color: 'ds.text_gray_medium',
            borderRadius: '8px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography>{pin}</Typography>
        </Box>
      ))}
    </Stack>
  );
};
