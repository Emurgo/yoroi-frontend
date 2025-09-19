import { Box, Button, Stack, Typography, styled, useTheme } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { useStrings } from '../../hooks/useStrings';
import { Switch } from '../../../../../components/Switch/Switch';
import { SwapAction, useSwapRevamp } from '../../../module/SwapContextProvider';
import { useModal } from '../../../../../components/modals/ModalContext';
import { DEX_ROUTING } from '../../constants';

const defaultSlippages = ['0', '0.1', '0.5', '1', '2', '3', '5', '10'];

export const SettingsModalContent = () => {
  const { swapManager, swapForm } = useSwapRevamp();
  const { closeModal } = useModal();

  const [routingPreferance, setRoutingPreferance] = useState<any>(swapForm.selectedProtocol.value || DEX_ROUTING.AUTO);
  const [selectedSlippage, setSelectedSlippage] = useState(swapForm.slippageInput.value || 1);
  const [isManualSlippage, setIsManualSlippage] = useState(!defaultSlippages.includes(String(selectedSlippage)));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const strings = useStrings();

  useEffect(() => {
    if (swapForm.slippageInput.value === 0) setSelectedSlippage(swapForm.slippageInput.value);
  }, [swapForm.slippageInput.value]);

  const handleManualSelect = () => {
    setIsManualSlippage(true);
    setSelectedSlippage('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const applyChanges = async () => {
    await swapForm.action({ type: SwapAction.ProtocolChanged, value: routingPreferance });
    await swapForm.action({ type: SwapAction.SlippageInputChanged, value: Number(selectedSlippage) });
    await swapManager.assignSettings({
      slippage: Number(selectedSlippage),
      routingPreferance: [routingPreferance],
    });
    closeModal();
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
        <RoutingPreferance setRoutingPreferance={setRoutingPreferance} routingPreferance={routingPreferance} />
      </Box>
      {/* @ts-ignore */}
      <SButton fullWidth variant="primary" onClick={applyChanges}>
        {strings.applyLabel}
      </SButton>
    </Box>
  );
};

const SButton = styled(Button)(({ theme }: any) => ({
  ...theme.atoms.my_lg,
  position: 'sticky',
  bottom: 0,
  borderTop: `1px solid ${theme.palette.ds.border_gray}`,
  zIndex: 1,
}));

const SlipageOptions = ({ setIsManualSlippage, setSelectedSlippage, isManualSlippage, selectedSlippage, onManualSelect }) => {
  const strings = useStrings();

  const slippages = defaultSlippages.map(val => ({
    value: val,
    label: `${val}%`,
    isActive: !isManualSlippage && val === String(selectedSlippage),
    onClick: () => {
      setIsManualSlippage(false);
      setSelectedSlippage(Number(val));
    },
  }));

  return (
    <Box display="flex" gap="8px" flexWrap="wrap">
      {slippages.map(({ value, label, isActive, onClick }) => (
        <SlippageTab key={value} label={label} isActive={isActive} onClick={onClick} />
      ))}

      <SlippageTab label={strings.manualLabel} isActive={isManualSlippage} onClick={onManualSelect} />
    </Box>
  );
};
const RoutingPreferance = ({ setRoutingPreferance, routingPreferance }) => {
  const strings = useStrings();

  const autoSelected = routingPreferance === DEX_ROUTING.AUTO;
  const dexHunter =
    routingPreferance === DEX_ROUTING.AUTO ||
    routingPreferance === DEX_ROUTING.DEXHUNTER ||
    routingPreferance === DEX_ROUTING.BOTH;
  const muesliswap =
    routingPreferance === DEX_ROUTING.AUTO ||
    routingPreferance === DEX_ROUTING.MUESLISWAP ||
    routingPreferance === DEX_ROUTING.BOTH;

  const handleDexHunterToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRoutingPreferance(checked ? DEX_ROUTING.DEXHUNTER : DEX_ROUTING.MUESLISWAP);
  };

  const handleMuesliswapToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRoutingPreferance(checked ? DEX_ROUTING.MUESLISWAP : DEX_ROUTING.DEXHUNTER);
  };

  const handleAutoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRoutingPreferance(checked ? DEX_ROUTING.AUTO : DEX_ROUTING.BOTH);
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
  const { atoms }: any = useTheme();
  return (
    <Box my="16px">
      <Box
        component="fieldset"
        sx={{
          ...atoms.p_lg,
          border: '1px solid',
          borderColor: 'ds.el_gray_max',
          borderRadius: '8px',
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
          inputMode="decimal"
          placeholder="0"
          value={selectedSlippage}
          onChange={e => {
            let raw = e.target.value;
            let clean = raw.replace(/[^0-9.]/g, '');
            const parts = clean.split('.');
            if (parts.length > 2) {
              clean = parts[0] + '.' + parts[1];
            }
            if (parts[1] && parts[1].length > 1) {
              clean = parts[0] + '.' + parts[1].slice(0, 1);
            }
            if (clean !== '' && Number(clean) > 75) return;

            setSelectedSlippage(clean);
          }}
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

const SlippageTab = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => {
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
