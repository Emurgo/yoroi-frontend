import React, { Component } from 'react';
import CardanoCrypto from 'rust-cardano-crypto';
import App from './App';

export default class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    /* (!) Attention: Before use any method from CardanoCrypto
           we must load the RustModule first.
    */
    CardanoCrypto.loadRustModule().then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    if (this.state.loading) {
      return 'loading...';
    }
    return (<App />);
  }
}
