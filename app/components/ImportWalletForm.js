import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import { validateMnemonic } from '../utils/crypto/BIP39';

class ImportWalletForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      secretWords: ''
    };
  }

  handleChange = (event) => {
    this.setState({ secretWords: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    console.log("importWallet", this.state.secretWords)
    if (validateMnemonic(this.state.secretWords)) {
      this.props.onSubmit(this.state.secretWords);
    } else {
      // TODO: Improve validate 12 words error
      alert('Invalid words');
    }
  };

  render() {
    return (
      <Grid container direction="column" justify="justify" alignItems="center">
        <Grid item>
          <TextField
            helperText="ex: legal winner thank year wave sausage worth useful legal winner thank yellow"
            label="Please insert your 12 words"
            rows={2}
            margin="normal"
            onChange={this.handleChange}
          />
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
