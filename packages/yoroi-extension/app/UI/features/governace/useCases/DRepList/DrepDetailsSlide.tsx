import React from 'react';
import { Box, Drawer, Divider, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { dRepToPreCip129 } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { useStrings } from '../../common/hooks/useStrings';
import type { DrepRow } from './DRepList';
import { DrepAvatar } from './DRepList';

// ── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
      fill="#242838"
    />
  </svg>
);

const CopyIcon = ({ done }: { done: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {done ? (
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#4b6dde" />
    ) : (
      <path
        d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
        fill="#6b7384"
      />
    )}
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#f59e0b" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.75l7.73-8.835-8.156-10.665h6.07l4.259 5.633L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
      fill="#6b7384"
    />
  </svg>
);

// ── ID field with copy ────────────────────────────────────────────────────────

const IdField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Stack direction="row" alignItems="flex-start" gap="16px">
      <Typography variant="body1" color="ds.text_gray_low" sx={{ flexShrink: 0, minWidth: 200 }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="flex-start" gap="8px" flex={1} minWidth={0}>
        <Typography variant="body1" color="ds.text_gray_medium" sx={{ wordBreak: 'break-all', flex: 1 }}>
          {value}
        </Typography>
        <Box onClick={handleCopy} sx={{ cursor: 'pointer', flexShrink: 0, mt: '2px' }}>
          <CopyIcon done={copied} />
        </Box>
      </Stack>
    </Stack>
  );
};

// ── Metadata section ─────────────────────────────────────────────────────────

const MetadataSection = ({ title, content }: { title: string; content: string }) => (
  <Stack gap="8px">
    <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
      {title}
    </Typography>
    <Typography variant="body1" color="ds.text_gray_medium" sx={{ whiteSpace: 'pre-wrap' }}>
      {content}
    </Typography>
  </Stack>
);

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  drep: DrepRow | null;
  onClose: () => void;
  onDelegate: () => void;
  isCurrentDrep: boolean;
  delegateDisabled: boolean;
};

export const DrepDetailsSlide = ({ drep, onClose, onDelegate, isCurrentDrep, delegateDisabled }: Props) => {
  const strings = useStrings();

  const legacyId = React.useMemo(() => {
    if (!drep) return '';
    try {
      return dRepToPreCip129(drep.bech32Id);
    } catch {
      return drep.bech32Id;
    }
  }, [drep?.bech32Id]);

  const nonSocialRefs = React.useMemo(
    () =>
      drep?.references.filter(
        r => !r.uri.includes('twitter.com') && !r.uri.includes('x.com')
      ) ?? [],
    [drep?.references]
  );

  return (
    <Drawer
      anchor="right"
      open={drep !== null}
      onClose={onClose}
      PaperProps={{ sx: { width: 530, display: 'flex', flexDirection: 'column' } }}
    >
      {drep && (
        <>
          {/* ── Header ── */}
          <SlideHeader>
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: '#242838' }}
            >
              {drep.name}
            </Typography>
            <CloseButton onClick={onClose}>
              <CloseIcon />
            </CloseButton>
          </SlideHeader>

          {/* ── Body ── */}
          <SlideBody>
            {/* Avatar + name + twitter */}
            <Stack direction="row" alignItems="center" gap="16px">
              <DrepAvatar imageUrl={drep.imageUrl} name={drep.name} />
              <Stack gap="4px">
                <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
                  {drep.name}
                </Typography>
                {drep.twitterUrl && (
                  <Box
                    component="a"
                    href={drep.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <XIcon />
                  </Box>
                )}
              </Stack>
            </Stack>

            <Divider />

            {/* DRep IDs */}
            <Stack gap="8px">
              <IdField label={strings.drepId} value={drep.bech32Id} />
              <IdField label={strings.legacyDrepId} value={legacyId} />
            </Stack>

            <Divider />

            {/* Verified content or warning */}
            {drep.metadataVerified ? (
              <>
                {drep.motivations && (
                  <>
                    <MetadataSection title={strings.motivations} content={drep.motivations} />
                    <Divider />
                  </>
                )}
                {drep.qualifications && (
                  <>
                    <MetadataSection title={strings.qualifications} content={drep.qualifications} />
                    <Divider />
                  </>
                )}
                {nonSocialRefs.length > 0 && (
                  <Stack gap="8px">
                    {nonSocialRefs.map((ref, i) => (
                      <Box
                        key={i}
                        component="a"
                        href={ref.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textDecoration: 'none' }}
                      >
                        <Typography variant="body1" color="ds.text_primary_medium">
                          {ref.label ?? ref.uri}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </>
            ) : (
              <Stack gap="16px">
                <Stack direction="row" alignItems="center" gap="8px">
                  <WarningIcon />
                  <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
                    {strings.unverifiedMetadataTitle}
                  </Typography>
                </Stack>
                <Typography variant="body1" color="ds.text_gray_medium">
                  {strings.unverifiedMetadataMessage}
                </Typography>
              </Stack>
            )}
          </SlideBody>

          {/* ── Footer ── */}
          <SlideFooter>
            <DelegateButton onClick={onDelegate} disabled={isCurrentDrep || delegateDisabled}>
              <Typography
                variant="body1"
                fontWeight={500}
                sx={{
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: isCurrentDrep || delegateDisabled ? '#a0b3f2' : '#ffffff',
                }}
              >
                {strings.delegateLabel}
              </Typography>
            </DelegateButton>
          </SlideFooter>
        </>
      )}
    </Drawer>
  );
};

// ── Styled components ─────────────────────────────────────────────────────────

const SlideHeader = styled(Box)(({ theme }: any) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px',
  height: '70px',
  borderBottom: `1px solid ${theme.palette.ds.gray_200}`,
  flexShrink: 0,
}));

const CloseButton = styled(Box)(() => ({
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  flexShrink: 0,
}));

const SlideBody = styled(Box)(() => ({
  flex: 1,
  overflowY: 'auto',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
}));

const SlideFooter = styled(Box)(({ theme }: any) => ({
  height: '96px',
  padding: '24px',
  borderTop: `1px solid ${theme.palette.ds.gray_200}`,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
}));

const DelegateButton = styled(Box)(() => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '13px 24px',
  borderRadius: '8px',
  background: '#4b6dde',
  cursor: 'pointer',
  '&[disabled]': {
    background: '#e8edf9',
    cursor: 'default',
    pointerEvents: 'none',
  },
})) as typeof Box;
