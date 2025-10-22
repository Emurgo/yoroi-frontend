// @flow
import * as React from 'react'
import { IconButton } from '@mui/material'
import { Box } from '@mui/system'
import { ReactComponent as SupportIcon } from '../../assets/images/support.inline.svg'

export default function Support(): React.Node {
  const iframeRef = React.useRef <? HTMLIFrameElement > (null)
  const [ready, setReady] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const crispSandboxUrl = React.useMemo(
    () => (chrome?.runtime?.getURL ? chrome.runtime.getURL('3rd-party-crisp/crisp.html') : '../../../chrome/content-scripts/3rd-party-crisp/crisp.html'),
    []
  )
  console.log("crispSandboxUrl", crispSandboxUrl)
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const { type } = (e.data || {})
      if (type === 'crisp:ready') setReady(true)
      if (type === 'crisp:opened') setOpen(true)
      if (type === 'crisp:closed') setOpen(false)
      if (type === 'crisp:error') console.error('[Crisp sandbox] error:', e.data)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const post = React.useCallback((msg) => {
    const el = iframeRef.current
    if (el?.contentWindow) el.contentWindow.postMessage(msg, '*')
  }, [])

  const openChat = () => post({ type: 'crisp:open' })
  const closeChat = () => post({ type: 'crisp:close' })

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 30, zIndex: 9998 }}>
      {ready && (
        <IconButton sx={{ p: '3px' }} onClick={open ? closeChat : openChat} aria-label="Toggle support chat">
          <SupportIcon />
        </IconButton>
      )}

      <iframe
        ref={iframeRef}
        title="Crisp Support"
        src={crispSandboxUrl}
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: open ? 380 : 0,   // ⬅️ give it size when open
          height: open ? 640 : 0,  // ⬅️ give it size when open
          border: 0,
          overflow: 'hidden',
          zIndex: 9997,
          transition: 'width 120ms ease, height 120ms ease',
          background: 'transparent',
        }}
      />
    </Box>
  )
}
