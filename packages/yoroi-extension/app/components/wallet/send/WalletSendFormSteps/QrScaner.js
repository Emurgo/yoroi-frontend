// @flow
import React, { Component } from 'react';
import Scanner from 'react-webcam-qr-scanner';
import { QrReader } from 'react-qr-reader';

type Props = {||}

export default class QRScaner extends Component<Props> {
   handleDecode = (result) => {
    console.log(result);
  }

  handleScannerLoad = (mode) => {
    console.log(mode);
  }

  render() {
      return (
        <>
          {/* <Scanner
            className="some-classname"
            onDecode={this.handleDecode}
            onScannerLoad={this.handleScannerLoad}
            constraints={{
            audio: false,
            video: {
              facingMode: 'environment'
            } }}
            captureSize={{ width: 1280, height: 720 }}
          /> */}

          <QrReader
            onResult={(result, error) => {
              if (result) {
                console.log(result?.text);
              }
            }}
            style={{ width: '200px' }}
          />
        </>
      )
  }
}