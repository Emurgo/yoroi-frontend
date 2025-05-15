import { Box, Button, Stack, Typography, styled } from '@mui/material';
import React, { useState, useRef } from 'react';
import { useStrings } from '../hooks/useStrings';
import { Switch } from '../../../../components/Switch/Switch';

const defaultSlippages = ['0', '0.1', '0.5', '1', '2', '3', '5', '10'];

export const SettingsModalContent = () => {
  const [selectedSlippage, setSelectedSlippage] = useState('1');
  const [isManualSlippage, setIsManualSlippage] = useState(!defaultSlippages.includes(selectedSlippage));

  const inputRef = useRef<HTMLInputElement | null>(null);
  const strings = useStrings();

  const handleManualSelect = () => {
    setIsManualSlippage(true);
    setSelectedSlippage('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" position="relative">
      {/* Scrollable content */}
      <Box flex={1} overflow="auto">
        <Typography variant="body1" color="ds.text_gray_medium" mb={16}>
          {strings.slippageTolerance}
        </Typography>
        <SlipageOptions
          setIsManualSlippage={setIsManualSlippage}
          setSelectedSlippage={setSelectedSlippage}
          isManualSlippage={isManualSlippage}
          selectedSlippage={selectedSlippage}
          onManualSelect={handleManualSelect}
        />
        {isManualSlippage && (
          <SlippageInput selectedSlippage={selectedSlippage} setSelectedSlippage={setSelectedSlippage} inputRef={inputRef} />
        )}
        <Typography variant="body1" color="ds.text_gray_medium" my={16}>
          {strings.routingPreferance}
        </Typography>
        <RoutingPreferance />
      </Box>
      {/* @ts-ignore */}
      <SButton fullWidth variant="primary">
        Apply
      </SButton>
    </Box>
  );
};

const SButton = styled(Button)(({ theme }:any) => ({
  ...theme.atoms.my_lg,
  position: 'sticky',
  bottom: 0,
  borderTop: `1px solid ${theme.palette.ds.border_gray}`,
  zIndex: 1,
}));

const SlipageOptions = ({
  setIsManualSlippage,
  setSelectedSlippage,
  isManualSlippage,
  selectedSlippage,
  onManualSelect,
}) => {
  const strings = useStrings();

  const slippages = defaultSlippages.map((val) => ({
    value: val,
    label: `${val}%`,
    isActive: !isManualSlippage && val === selectedSlippage,
    onClick: () => {
      setIsManualSlippage(false);
      setSelectedSlippage(val);
    },
  }));

  return (
    <Box display="flex" gap="8px" flexWrap="wrap">
      {slippages.map(({ value, label, isActive, onClick }) => (
        <SlippageTab key={value} label={label} isActive={isActive} onClick={onClick} />
      ))}

      <SlippageTab
        label={strings.manualLabel}
        isActive={isManualSlippage}
        onClick={onManualSelect}
      />
    </Box>
  );
};
const RoutingPreferance = () => {
  const [autoSelected, setAutoSelected] = useState(true);
  const [dexHunter, setDexHunter] = useState(true);
  const [muesliswap, setMuesliswap] = useState(true); // Both true by default when auto is off
  const strings = useStrings();

  const handleDexHunterToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    if (!value && !muesliswap) {
      setMuesliswap(true);
    }
    setDexHunter(value);
  };

  const handleMuesliswapToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;

    if (!value && !dexHunter) {
      setDexHunter(true);
    }
    setMuesliswap(value);
  };

  const handleAutoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setAutoSelected(value);
    if (value) {
      setDexHunter(true);
      setMuesliswap(false);
    } else {
      setDexHunter(true);
      setMuesliswap(true);
    }
  };

  return (
    <Stack gap={32}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={14}>
        <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
          {strings.autoLabel}
        </Typography>
        <Switch checked={autoSelected} onChange={handleAutoChange} />
      </Stack>

      {!autoSelected && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={14}>
            <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
              DexHunter
            </Typography>
            <Switch checked={dexHunter} onChange={handleDexHunterToggle} />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={14}>
            <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
              MuesliSwap
            </Typography>
            <Switch checked={muesliswap} onChange={handleMuesliswapToggle} />
          </Stack>
        </>
      )}
    </Stack>
  );
};

const SlippageInput = ({ selectedSlippage, setSelectedSlippage, inputRef }) => {
  const strings = useStrings();

  return (
    <Box my="16px">
      <Box
        component="fieldset"
        sx={{
          border: '1px solid',
          borderColor: 'ds.el_gray_max',
          borderRadius: '8px',
          p: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          justifyContent: 'start',
          position: 'relative',
          bgcolor: 'ds.bg_color_max',
          columnGap: '6px',
          rowGap: '8px',
          maxHeight: '56px',
        }}
      >
        <Box
          component="legend"
          sx={{
            top: '-7px',
            left: '16px',
            position: 'absolute',
            px: '4px',
            bgcolor: 'ds.bg_color_max',
            color: 'ds.text_gray_medium',
          }}
        >
          {strings.slippageTolerance}
        </Box>

        <input
          ref={inputRef}
          type="text"
          placeholder="0"
          value={selectedSlippage}
          onChange={e => setSelectedSlippage(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: '16px',
            color: 'var(--ds-text-gray-medium)',
          }}
        />
      </Box>
      {/* ts-ignore */}
      <Typography variant="caption" color="ds.text_gray_low" pt={4}>
        {strings.slippageInputInfo}
      </Typography>

      <Box mt="24px" p="16px" bgcolor="ds.sys_yellow_100" borderRadius="8px">
        <Typography component="div" variant="body1" color="grayscale.max">
          {strings.slippageToleranceHigh}
        </Typography>
      </Box>
    </Box>
  );
};


const SlippageTab = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <Box
      onClick={onClick}
      p={8}
      borderRadius="8px"
      bgcolor={isActive ? 'ds.gray_200' : 'transparent'}
      sx={{
        cursor: 'pointer',
        border: `1px solid ${isActive ? 'ds.gray_300' : 'ds.gray_200'}`,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: !isActive ? 'ds.gray_100' : undefined,
        },
      }}
    >
      <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
        {label}
      </Typography>
    </Box>
  );
};
