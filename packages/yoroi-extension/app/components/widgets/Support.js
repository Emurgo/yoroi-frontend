// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { ReactComponent as SupportIcon } from '../../assets/images/support.inline.svg';
import { IconButton } from '@mui/material';
import { Box } from '@mui/system';
import environment from '../../environment';

type Props = {||}
type State = {|
  open: boolean,
|}
export default class Support extends Component <Props, State> {

  state: State = {
    open: false,
  }

  messageHandler: any => void = (event) => {
    if (event.origin === 'null') {
      return
    }

    const eventType = event.data;
    if (eventType === 'close') {
      this.setState({ open: false })
    }
  }

  componentDidMount() {
    window.addEventListener('message', this.messageHandler, false);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.messageHandler);
  }

  getUrl(): string | null {
    if (!environment.userAgentInfo.isExtension()) return null;
    const agent = environment.userAgentInfo.isFirefox() ? 'firefox' : 'chrome'
    return `https://emurgo.github.io/yoroi-support/?source=${agent}&extensionId=${window.location.hostname}`;
  }

  render(): Node {
    const { open } = this.state;

    const url = this.getUrl();
    if (url === null) return null;

    return (
      <Box
        sx={{
          position: 'absolute',
          bottom: '24px',
          right: '30px',
          zIndex: '9999',
        }}
      >
        {open === false &&
        <IconButton
          sx={{
            padding: '3px',
          }}
          onClick={() => this.setState({ open: true })}
        >
          <SupportIcon />
        </IconButton>}
        <iframe
          style={{ marginRight: '-20px', marginBottom: '-30px', display: open ? 'block' : 'none' }}
          width='375px'
          height='560px'
          src={url}
          title='Zendesk'
        />
      </Box>
    )
  }
}