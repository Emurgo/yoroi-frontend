import { Typography, Button, Stack, Box, Dialog, DialogContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState, useMemo } from 'react';
import { IconWrapper, Icons } from '../icons/index';
import { useStrings } from '../../common/hooks/useStrings';
import { useYoroiRemoteConfig } from '../../common/hooks/useYoroiRemoteConfig';
import LocalStorageApi from '../../../api/localStorage/index';
import { SecondFiPage1Illustration } from './secondfi/SecondFiPage1Illustration';
import { SecondFiPage2Illustration } from './secondfi/SecondFiPage2Illustration';
import { SecondFiPage3Illustration } from './secondfi/SecondFiPage3Illustration';
import { SecondFiPage4Illustration } from './secondfi/SecondFiPage4Illustration';

let hasProcessedThisSession = false;

export const SecondFiTeasingDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useYoroiRemoteConfig();
  const localStorage = useMemo(() => new LocalStorageApi(), []);

  useEffect(() => {
    const checkModalState = async () => {
      if (!data?.popups?.secondFiTeaser?.display || hasProcessedThisSession) return;

      hasProcessedThisSession = true;

      const wasClosed = await localStorage.getSecondFiTeasingModalClosed();
      if (wasClosed !== 'true') setIsOpen(true);
    };

    checkModalState();
  }, [data]);

  const handleClose = async () => {
    await localStorage.setSecondFiTeasingModalClosed('true');
    setIsOpen(false);
  };

  return (
    <StyledDialog open={isOpen} onClose={handleClose}>
      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <SecondFiModalContent onClose={handleClose} />
      </DialogContent>
    </StyledDialog>
  );
};

type SecondFiModalContentProps = {
  onClose: () => void;
};

const TOTAL_PAGES = 4;

const SecondFiModalContent = ({ onClose }: SecondFiModalContentProps) => {
  const [page, setPage] = useState(0);
  const strings = useStrings();
  const isLastPage = page === TOTAL_PAGES - 1;

  const pages = [
    {
      illustration: <SecondFiPage1Illustration />,
      title: strings.secondFiPage1Title,
      description: strings.secondFiPage1Description,
    },
    {
      illustration: <SecondFiPage2Illustration />,
      title: strings.secondFiPage2Title,
      description: strings.secondFiPage2Description,
    },
    {
      illustration: <SecondFiPage3Illustration />,
      title: strings.secondFiPage3Title,
      description: strings.secondFiPage3Description,
    },
    {
      illustration: <SecondFiPage4Illustration />,
      title: strings.secondFiPage4Title,
      description: strings.secondFiPage4Description,
    },
  ];

  const { illustration, title, description } = pages[page]!;

  const handleNext = () => {
    if (isLastPage) {
      onClose();
    } else {
      setPage(prev => prev + 1);
    }
  };

  return (
    <Stack direction="column" height="100%">
      {/* Header: step indicators + close button */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: '24px',
          backgroundColor: 'ds.bg_color_max',
          flexShrink: 0,
        }}
      >
        <StepIndicators total={TOTAL_PAGES} current={page} />
        <IconWrapper
          aria-label="close"
          icon={Icons.CloseIcon}
          color="ds.el_gray_max"
          borderColor="ds.el_gray_max"
          asButton
          buttonProps={{
            onClick: onClose,
            sx: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' },
          }}
          iconButtonId="secondFiTeasing-closeModal-crossIconbutton"
        />
      </Box>

      {/* Content: illustration + text */}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: '0px',
        }}
      >
        <Stack direction="column" alignItems="center" gap="16px" sx={{ width: '560px' }}>
          {illustration}

          <Stack direction="column" gap="8px" sx={{ textAlign: 'center', color: 'ds.text_gray_medium', width: '100%' }}>
            <Typography
              sx={{
                fontFamily: 'Rubik, sans-serif',
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '26px',
              }}
            >
              {title}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'Rubik, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '24px',
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Footer: action button */}
      <Box sx={{ p: '24px', backgroundColor: 'ds.bg_color_max', flexShrink: 0 }}>
        <NextButton variant="contained" color="primary" onClick={handleNext}>
          {isLastPage ? strings.secondFiClose : strings.secondFiNext}
        </NextButton>
      </Box>
    </Stack>
  );
};

type StepIndicatorsProps = {
  total: number;
  current: number;
};

const StepIndicators = ({ total, current }: StepIndicatorsProps) => (
  <Box sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <StepDot key={i} stepNumber={i + 1} active={i === current} />
    ))}
  </Box>
);

type StepDotProps = {
  stepNumber: number;
  active: boolean;
};

const StepDot = ({ stepNumber, active }: StepDotProps) => (
  <Box
    sx={
      active
        ? {
            width: 24,
            height: 24,
            borderRadius: '24px',
            backgroundColor: 'ds.el_primary_medium',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }
        : {
            border: '2px solid #a7afc0',
            borderRadius: '24px',
            px: '6px',
            py: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }
    }
  >
    <Typography
      sx={{
        fontFamily: 'Rubik, sans-serif',
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '22px',
        color: active ? 'white' : '#a7afc0',
        textAlign: 'center',
        ...(active ? {} : { width: '12px' }),
      }}
    >
      {stepNumber}
    </Typography>
  </Box>
);

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiPaper-root': {
    borderRadius: '8px',
    width: '612px',
    maxWidth: '612px',
    height: '559px',
    maxHeight: '559px',
    margin: 0,
    overflow: 'hidden',
  },
  '& .MuiDialogContent-root': {
    padding: 0,
  },
}));

const NextButton = styled(Button)(() => ({
  width: '100%',
  fontSize: '16px',
  fontFamily: 'Rubik, sans-serif',
  fontWeight: 500,
  lineHeight: '22px',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  padding: '13px 24px',
  borderRadius: '8px',
}));
