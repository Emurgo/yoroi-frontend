import React, { Component } from 'react';
import {
  MuiThemeProvider,
  createMuiTheme
} from 'material-ui/styles';
import Loading from '../components/ui/loading/Loading';
import { loadRustModule } from 'rust-cardano-crypto';
import App from './App';

const theme = createMuiTheme();

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
    loadRustModule().then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        {this.state.loading &&
          <Loading />
        }
        {!this.state.loading && <App />}
      </MuiThemeProvider>
    );
  }
}
