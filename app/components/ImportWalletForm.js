import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { validateMnemonic } from '../crypto/BIP39';

class ImportWalletForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      secretWords: ''
    };
  }

  handleChange = (event) => {
    this.setState({ secretWords: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (validateMnemonic(this.state.secretWords)) {
      this.props.onSubmit(this.state.secretWords);
    } else {
      // TODO: Improve validate 12 words error
      alert('Invalid words');
    }
  }

  render() {
    return (
      <form>
        <label>
          Please insert your 12 words:
          <br />
          <input
            type="text"
            value={this.state.secretWords}
            placeholder="legal winner thank year wave sausage worth useful legal winner thank yellow"
            onChange={this.handleChange}
          />
        </label>
        <button onClick={this.handleSubmit}> Import </button>
      </form>
    );
  }
}

ImportWalletForm.propTypes = {
  onSubmit: PropTypes.func
};

export default ImportWalletForm;
