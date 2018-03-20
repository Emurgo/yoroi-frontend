import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';

class SendAdaForm extends Component {

  handleChange = field => (event) => {
    this.setState({ [field]: event.target.value });
  };

  handleSubmit = submitCb => () => {
    submitCb(this.state);
  }

  render() {
    return (
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <TextField
            label="To"
            margin="normal"
            onChange={this.handleChange('to')}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Amount"
            margin="normal"
            onChange={this.handleChange('amount')}
          />
        </Grid>
        <Grid item>
          <Button variant="raised" color="primary" onClick={this.handleSubmit(this.props.onSubmit)}>
            Send
          </Button>
        </Grid>
      </Grid>
    );
  }
}

SendAdaForm.propTypes = {
  onSubmit: PropTypes.func
};

export default SendAdaForm;
