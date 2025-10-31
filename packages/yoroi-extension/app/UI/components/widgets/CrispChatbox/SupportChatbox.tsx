import React from 'react';
import { IconButton, Box } from '@mui/material';
import { Icon } from '../../icons';

const CRISP_URL = 'https://emurgo.github.io/yoroi-crisp-support/';
const CRISP_ORIGIN = new URL(CRISP_URL).origin;

const OPEN_WIDTH = 480;
const OPEN_HEIGHT = 750;

export const SupportChatbox: React.FC = () => {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const type = (e.data as any)?.type;
      if (!type) return;
      switch (type) {
        case 'crisp:ready':
          setReady(true);
          break;
        case 'crisp:opened':
          setOpen(true);
          break;
        case 'crisp:closed':
          setOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const post = React.useCallback((type: 'crisp:open' | 'crisp:close') => {
    iframeRef.current?.contentWindow?.postMessage({ type }, CRISP_ORIGIN);
  }, []);

  const handleOpen = React.useCallback(() => {
    setOpen(true);

    // Allow iframe resize to apply before sending the open command
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (ready) post('crisp:open');
        // Safety re-fire in case Crisp wasn’t initialized yet
        // setTimeout(() => ready && post('crisp:open'), 120);
      });
    });
  }, [ready, post]);

  const handleClose = React.useCallback(() => {
    if (ready) post('crisp:close');
    setOpen(false);
  }, [ready, post]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 24,
        zIndex: 9998,
      }}
    >
      <IconButton
        sx={{ p: 0.75 }}
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? 'Close support chat' : 'Open support chat'}
      >
        <Icon.ChatboxSupport />
      </IconButton>

      {/* Crisp Iframe */}
      <iframe
        ref={iframeRef}
        title="Yoroi Support"
        src={CRISP_URL}
        width={open ? OPEN_WIDTH : 0}
        height={open ? OPEN_HEIGHT : 0}
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          border: 0,
          zIndex: 9997,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'width 0s ease, height 0.1s ease',
        }}
      />
    </Box>
  );
};
