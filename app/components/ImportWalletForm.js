import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tabs, { Tab } from 'material-ui/Tabs';
import AppBar from 'material-ui/AppBar';
import Typography from 'material-ui/Typography';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import Check from 'material-ui-icons/Check';
import Input from 'material-ui-icons/Input';
import List from 'material-ui/List';
import Chip from 'material-ui/Chip';
import { validateMnemonic, generateMnemonicImpl } from '../utils/crypto/BIP39';
import Bip39Autocomplete from '../components/ui/autocomplete/autocomplete';
import style from './ImportWalletForm.css';

class ImportWalletForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      secretWords: '',
      swapIndex: this.IMPORT_SWAP_INDEX,
      newWords: this.generate12Words()
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

  onTabChange = (event, value) => {
    this.setState({ swapIndex: value });
    event.preventDefault();
  };

  regenerateNewWords = () => {
    this.setState({
      newWords: this.generate12Words()
    });
  }

  generate12Words = () => {
    return generateMnemonicImpl().split(' ');
  }

  getNewWords = () => {
    return this.state.newWords.join(' ');
  }

  get12WordsComponent = () => {
    return (
      <div className={style.wordsContainer}>
        {
          this.state.newWords.map((word) => {
            return (
              <Chip
                className={style.word}
                label={word}
              />
            );
          })
        }
      </div>
    );
  }

  getCreateWalletComponent = (onCreate) => {
    return (
      <div className={style.createContainer}>
        <Typography className={style.description} variant="subheading"> Your 12 new words: </Typography>
        {this.get12WordsComponent()}
        <div className={style.formButtons}>
          <div>
            <Button variant="fab" color="primary" onClick={() => onCreate(this.getNewWords())}>
              <Check />
            </Button>
          </div>
          <div className={style.formRightButton}>
            <Button size="small" variant="raised" color="link" onClick={() => this.regenerateNewWords()}>
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  IMPORT_SWAP_INDEX = 0;
  CREATE_SWAP_INDEX = 1;

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
          <Tabs value={this.state.swapIndex} onChange={this.onTabChange} fullWidth>
            <Tab label="Import" />
            <Tab label="Create" />
          </Tabs>
        </AppBar>
        <List>
          {this.state.swapIndex === this.IMPORT_SWAP_INDEX &&
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
          }
          {this.state.swapIndex === this.CREATE_SWAP_INDEX &&
            this.getCreateWalletComponent(this.props.onSubmit)
          }
        </List>
      </div>
    );
  }
}

ImportWalletForm.propTypes = {
  onSubmit: PropTypes.func
};

export default ImportWalletForm;
