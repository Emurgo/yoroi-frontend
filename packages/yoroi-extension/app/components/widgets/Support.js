// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { ReactComponent as SupportIcon } from '../../assets/images/support.inline.svg';
import { IconButton } from '@mui/material';

type Props = {||}

export default class Support extends Component <Props> {

  loadScript(src: string, id: string): void {
      const script = document.createElement('script')
      script.src = src
      script.id = id
      document.body?.appendChild(script)
  }

  componentDidMount() {
      this.loadScript('https://static.zdassets.com/ekr/snippet.js?key=68b95d72-6354-4343-8a64-427979a6f5d6', 'ze-snippet');

      const interval = setInterval(()=>{
        if (typeof window.zE !== 'undefined' && typeof window.zE.hide === 'function') {
          window.zE.hide()
          if (interval) {
            clearInterval(interval)
          }
        }
      }, 500);
  }

  openChatBoxSupport(){
    if (typeof window.zE !== 'undefined') {
        window.zE.activate()
      }
  }

  render(): Node {
      return (
        <IconButton
          sx={{
            position: 'absolute',
            bottom: '24px',
            right: '30px',
            zIndex: '9999', // Support button should be on top of every component including models!
            padding: '3px',
          }}
          onClick={this.openChatBoxSupport.bind(this)}
        >
          <SupportIcon />
        </IconButton>
      )
  }
}