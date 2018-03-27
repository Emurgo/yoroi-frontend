import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Toolbar from 'material-ui/Toolbar';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import Input from 'material-ui-icons/Input';
import List from 'material-ui/List';
import { validateMnemonic } from '../utils/crypto/BIP39';
import Bip39Autocomplete from '../components/ui/autocomplete/autocomplete';
import style from './ImportWalletForm.css';

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
      <div>
        <div className={style.headerContent}>
            <div className={style.title}>
            <Avatar className={style.logo} src="img/cardano-logo-white.inline.svg" />

              <Typography color="inherit" variant="headline"> Icarus Wallet </Typography>
              <Typography color="inherit" variant="subHeading"> Proof of concept</Typography>
            </div>
        </div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit">
              Import your wallet
            </Typography>
          </Toolbar>
        </AppBar>
        <List>
        <div className={style.formContainer}>
          <Bip39Autocomplete
            error={this.state.error}
            words={this.state.secretWords}
            onChange={this.handleChange}
          />
          <div className={style.formButton}>
            <Button className={style.formButton} variant="fab" color="primary" onClick={this.handleSubmit}>
              <Input />
            </Button>
          </div>
        </div>
        </List>
      </div>
    );
  }
}

ImportWalletForm.propTypes = {
  onSubmit: PropTypes.func
};

export default ImportWalletForm;
