import { Box, Button, Stack, Typography, styled, useTheme } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { useStrings } from '../../hooks/useStrings';
import { Switch } from '../../../../../components/Switch/Switch';
import { SwapActionType, useSwapRevamp } from '../../../module/SwapContextProvider';
import { useModal } from '../../../../../components/modals/ModalContext';
import { Aggregator, DEX_ROUTING, RoutingPref } from '../../constants';
import { sanitizeSlippageInput } from '../../helpers';

const defaultSlippages = ['0', '0.1', '0.5', '1', '2', '3', '5', '10'];

export const SettingsModalContent = () => {
  const { swapManager, swapForm } = useSwapRevamp();
  const { closeModal } = useModal();

  const [routingPreference, setRoutingPreference] = useState<any>(swapManager.settings.routingPreference);
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
    await swapForm.action({
      type: SwapActionType.ProtocolSelected,
      value: routingPreference,
    });
    await swapForm.action({ type: SwapActionType.SlippageInputChanged, value: Number(selectedSlippage) });
    await swapManager.assignSettings({
      slippage: Number(selectedSlippage),
      routingPreference: routingPreference,
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
          {strings.routingPreference}
        </Typography>
        <RoutingPreference setRoutingPreference={setRoutingPreference} routingPreference={routingPreference} />
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

const ALL: Aggregator[] = [DEX_ROUTING.DEXHUNTER, DEX_ROUTING.MUESLISWAP]; // remove MINSWAP for now DEX_ROUTING.MINSWAP

export const seedAllManual = (): Aggregator[] => [...ALL];

export const toggleAggregator = (current: Aggregator[], target: Aggregator): Aggregator[] =>
  current.includes(target) ? current.filter(x => x !== target) : [...current, target];

type Props = {
  routingPreference: RoutingPref;
  setRoutingPreference: (val: RoutingPref) => void;
};

export const RoutingPreference: React.FC<Props> = ({ routingPreference, setRoutingPreference }) => {
  const strings = useStrings();

  const isAuto = routingPreference === DEX_ROUTING.AUTO;
  const list: Aggregator[] = Array.isArray(routingPreference) ? routingPreference : [];

  const setAuto = (on: boolean) => {
    setRoutingPreference(on ? DEX_ROUTING.AUTO : seedAllManual());
  };

  const onToggle = (dex: Aggregator) => {
    const nextList = toggleAggregator(list, dex);
    setRoutingPreference(nextList.length === 0 ? DEX_ROUTING.AUTO : nextList);
  };

  return (
    <Stack gap={32}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={14}>
        <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
          {strings.autoLabel}
        </Typography>
        <Switch checked={isAuto} onChange={e => setAuto(e.target.checked)} />
      </Stack>

      {!isAuto && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={14}>
            <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
              DexHunter
            </Typography>
            <Switch checked={list.includes(DEX_ROUTING.DEXHUNTER)} onChange={() => onToggle(DEX_ROUTING.DEXHUNTER)} />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={14}>
            <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
              MuesliSwap
            </Typography>
            <Switch checked={list.includes(DEX_ROUTING.MUESLISWAP)} onChange={() => onToggle(DEX_ROUTING.MUESLISWAP)} />
          </Stack>

          {/* <Stack direction="row" justifyContent="space-between" alignItems="center" gap={14}>
            <Typography variant="body1" color="ds.text_gray_medium" fontWeight={500}>
              Minswap
            </Typography>
            <Switch checked={list.includes(DEX_ROUTING.MINSWAP)} onChange={() => onToggle(DEX_ROUTING.MINSWAP)} />
          </Stack> */}
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
            const next = sanitizeSlippageInput(e.target.value, { max: 75, maxDecimals: 1 });
            if (next === null) return;
            setSelectedSlippage(next);
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
