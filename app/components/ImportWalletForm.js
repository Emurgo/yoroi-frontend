import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import { validateMnemonic } from '../utils/crypto/BIP39';
import Bip39Autocomplete from '../components/ui/autocomplete/autocomplete';

class ImportWalletForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      secretWords: ''
    };
  }

  handleChange = (secretWords) => {
    this.setState({ secretWords });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const words = this.state.secretWords.split(',').join(' ');
    if (validateMnemonic(words)) {
      this.props.onSubmit(words);
    } else {
      this.setState({ error: 'Invalid words' });
    }
  };

  render() {
    return (
      <Grid container>
        <Grid item xs={12}>
          <Bip39Autocomplete error={this.state.error} words={this.state.secretWords} onChange={this.handleChange} />
        </Grid>
        <Grid item>
          <Button variant="raised" color="primary" onClick={this.handleSubmit}> Import </Button>
        </Grid>
      </Grid>
    );
  }
}

ImportWalletForm.propTypes = {
  onSubmit: PropTypes.func
};

export default ImportWalletForm;
