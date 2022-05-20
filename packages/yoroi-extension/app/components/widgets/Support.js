// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { ReactComponent as SupportIcon } from '../../assets/images/support.inline.svg';
import { IconButton } from '@mui/material';

export default class Support extends Component <{||}> {
    loadScript = (src, id) => {
        const script = document.createElement('script')
        script.src = src
        script.id = id

        script.addEventListener('load', () => {
          console.log('script loaded!')
        })

        script.addEventListener('error', (e) => {
          console.log(`SCRIPT LOAD ERROR : ${e.message}`);
        })

        document.body.appendChild(script)
    }

    componentDidMount() {
        this.loadScript('https://static.zdassets.com/ekr/snippet.js?key=68b95d72-6354-4343-8a64-427979a6f5d6', 'ze-snippet');
        this.interval = setInterval(()=>{
          if (typeof window.zE !== 'undefined' && typeof window.zE.hide === 'function') {
            window.zE.hide()
            clearInterval(this.interval)
          }
        }, 500);
    }

    openChatBoxSupport(){
        if (typeof window.zE !== 'undefined') {
          window.zE.activate()
        }
    }

    // componentDidMount() {
    //     this.interval = setInterval(()=>{
    //       if (typeof window.zE !== 'undefined') {
    //         // window.zE.hide()
    //         clearInterval(this.interval)
    //       }
    //     }, 500);
    // }    

    render(): Node {
        return (
          <IconButton
            sx={{
              position: 'absolute',
              bottom: '24px',
              right: '30px',
              zIndex: '1',
              padding: '0px'
            }}
            className="main-btn"
            onClick={this.openChatBoxSupport}
          >
            <SupportIcon />
          </IconButton>
        )
    }
}