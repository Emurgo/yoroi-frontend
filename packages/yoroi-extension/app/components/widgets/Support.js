// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { ReactComponent as SupportIcon } from '../../assets/images/support.inline.svg';
import { IconButton } from '@mui/material';
import { Box } from '@mui/system';

type Props = {||}
type State = {|
  open: boolean,
|}
export default class Support extends Component <Props, State> {

  state: State = {
    open: false,
  }

  messageHandler = (event: any) => {
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

  render(): Node {
    const { open } = this.state;
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
          style={{ marginRight: '-20px', marginBottom: '-30px' }}
          width={open ? '375px' : '0px'}
          height={open ? '560px': '0px'}
          src="https://emurgo.github.io/yoroi-support/?extensionId=lenadjbonljinhejgofjblhkkopjmmfn&source=chrome"
          title='Zendesk'
        />
      </Box>
    )
  }
}