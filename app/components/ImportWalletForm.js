import React, { Component } from "react";
import PropTypes from "prop-types";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";

import { validateMnemonic } from "../utils/crypto/BIP39";

class ImportWalletForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      secretWords: ""
    };
  }

  handleChange = event => {
    this.setState({ secretWords: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (validateMnemonic(this.state.secretWords)) {
      this.props.onSubmit(this.state.secretWords);
    } else {
      // TODO: Improve validate 12 words error
      alert("Invalid words");
    }
  };

  render() {
    return (
      <div>
        <TextField
          hintText="legal winner thank year wave sausage worth useful legal winner thank yellow"
          floatingLabelText="Please insert your 12 words"
          multiLine={true}
          rows={2}
          onChange={this.handleChange}
        />
        <br />
        <RaisedButton label="Import" primary={true} onClick={this.handleSubmit} />
      </div>
    );
  }
}

ImportWalletForm.propTypes = {
  onSubmit: PropTypes.func
};

export default ImportWalletForm;
