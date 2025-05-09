import { Box, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useStrings } from '../hooks/useStrings';
import Tabs from '../../../../components/tabs/Tabs';

const defaultSlippages = ['0', '0.1', '0.5', '1', '2', '3', '5', '10'];

export const SettingsModalContent = () => {
  const [selectedSlippage, setSelectedSlippage] = useState('1');
  const [isManualSlippage, setIsManualSlippage] = useState(!defaultSlippages.includes(selectedSlippage));

  const strings = useStrings();
  return (
    <Stack>
      <Typography variant="body1" color="ds.text_gray_medium" mb={16}>
        {strings.slippageTolerance}
      </Typography>
      <SlipageOptions
        setIsManualSlippage={setIsManualSlippage}
        setSelectedSlippage={setSelectedSlippage}
        isManualSlippage={isManualSlippage}
        selectedSlippage={selectedSlippage}
      />
        <Typography variant="body1" color="ds.text_gray_medium" mb={16}>
         {strings.routingPreferance}
      </Typography>
    </Stack>
  );
};

const SlipageOptions = ({ setIsManualSlippage, setSelectedSlippage, isManualSlippage, selectedSlippage }) => {
  const strings = useStrings();
  return (
    <Box display="flex" justifyContent="flex-start" mb="32" py={8}>
      <Tabs
        tabs={defaultSlippages
          .map(val => ({
            label: `${val}%`,
            isActive: !isManualSlippage && val === selectedSlippage,
            onClick: () => {
              setIsManualSlippage(false);
              setSelectedSlippage(val);
            },
          }))
          .concat({
            label: strings.manualLabel,
            isActive: isManualSlippage,
            onClick: () => {
              setIsManualSlippage(true);
            },
          })}
      />
    </Box>
  );
};
