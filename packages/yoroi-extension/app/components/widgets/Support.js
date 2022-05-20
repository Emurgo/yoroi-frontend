// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { Box } from '@mui/system';
import { ReactComponent as SupportIcon } from '../../assets/images/support.inline.svg';
import { Button, IconButton } from '@mui/material';

export default class Support extends Component <{||}> {
    loadScript = (src, id) => {
        const script = document.createElement('script')
        script.src = src
        // script.setAttribute('Content-Security-Policy', "script-src 'self'")
        console.log(script)

        if (id) {
          script.id = id
        }

        script.addEventListener('load', () => {
          console.log(`SCRIPT LOADED : ${script.src}`);
        })

        script.addEventListener('error', (e) => {
          console.log(`SCRIPT LOAD ERROR : ${e.message}`);
        })

        document.body.appendChild(script)
    }

    // eslint-disable-next-line react/no-deprecated
    componentWillMount() {
        // Start of emurgohelpdesk Zendesk Widget script -->
        this.loadScript('https://static.zdassets.com/ekr/snippet.js?key=68b95d72-6354-4343-8a64-427979a6f5d6', 'ze-snippet');
        // End of emurgohelpdesk Zendesk Widget script <--
    }

    openChatBoxSupport(){
        if (typeof window.zE !== 'undefined') {
          window.zE.activate()
        }
    }

    componentWillUnmount(){
        window.zE.hide()
    }

    render(): Node {
        return (
          <IconButton
            sx={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              zIndex: '1',
              padding: '0px'
            }}
            onClick={this.openChatBoxSupport}
          >
            <SupportIcon />
          </IconButton>
        )
    }
}