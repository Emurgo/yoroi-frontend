import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Popover from 'material-ui/Popover';
import Typography from 'material-ui/Typography';

class SendAdaForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      to: '',
      amount: '',
      notification: false,
      message: ''
    };
  }

  hideNotification = () => {
    this.setState({
      notification: false,
      message: ''
    });
  };

  showNotification = (message) => {
    this.setState({
      notification: true,
      message
    });
    setTimeout(this.hideNotification, 1000);
  }

  handleChange = field => (event) => {
    this.setState({ [field]: event.target.value });
  };

  handleSubmit = submitPromise => () => {
    if (this.state && this.state.to && this.state.amount) {
      submitPromise(this.state)
      .then(() => {
        this.clearFields();
        this.showNotification('Transaction Sent ok!');
      })
      .catch((error) => {
        console.error('[SendAdaForm.handleSubmit] Errors', error);
        this.showNotification('Error: Failed to Send Transaction!');
      });
    }
  }

  clearFields = () => {
    this.setState({
      to: '',
      amount: ''
    });
  }

  render() {
    return (
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <TextField
            label="To"
            margin="normal"
            value={this.state.to}
            onChange={this.handleChange('to')}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Amount"
            margin="normal"
            value={this.state.amount}
            onChange={this.handleChange('amount')}
          />
        </Grid>
        <Grid item>
          <Button variant="raised" color="primary" onClick={this.handleSubmit(this.props.submitPromise)}>
            Send
          </Button>
        </Grid>
        <Popover
          open={this.state.notification}
          onClose={this.hideNotification}
          anchorReference="anchorPosition"
          anchorPosition={{ left: 0, top: window.innerHeight }}
        >
          <Typography > {this.state.message} </Typography>
        </Popover>
      </Grid>
    );
  }
}

SendAdaForm.propTypes = {
  submitPromise: PropTypes.func
};

export default SendAdaForm;
