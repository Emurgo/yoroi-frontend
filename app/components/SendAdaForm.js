import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class SendAdaForm extends Component {

  handleChange = field => (event) => {
    this.setState({ [field]: event.target.value });
  };

  handleSubmit = submitCb => () => {
    submitCb(this.state);
  }

  render() {
    return (
      <div>
        <TextField
          hintText=""
          floatingLabelText="To"
          onChange={this.handleChange('to')}
        />
        <TextField
          hintText=""
          floatingLabelText="Amount"
          onChange={this.handleChange('amount')}
        />
        <RaisedButton label="Import" primary onClick={this.handleSubmit(this.props.onSubmit)} />
      </div>
    );
  }
}

SendAdaForm.propTypes = {
  onSubmit: PropTypes.func
};

export default SendAdaForm;
