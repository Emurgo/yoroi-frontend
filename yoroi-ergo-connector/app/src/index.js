// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const root = document.querySelector('#root');
if (root == null) {
  throw new Error('Root element not found.');
}

ReactDOM.render(<App />, root);
