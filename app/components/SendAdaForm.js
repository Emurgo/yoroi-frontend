import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import List, { ListItem } from 'material-ui/List';
import Stepper, { Step, StepLabel } from 'material-ui/Stepper';
import Typography from 'material-ui/Typography';
import Send from 'material-ui-icons/Send';
import Check from 'material-ui-icons/Check';
import Refresh from 'material-ui-icons/Refresh';
import NumberFormat from 'react-number-format';
import style from './SendAdaForm.css';

class SendAdaForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      to: '',
      amount: '',
      activeStep: this.CREATE_STEP
    };
  }

  getSteps = () => {
    return ['Create', 'Confirm', 'Finish'];
  }

  CREATE_STEP = 0;
  CONFIRM_STEP = 1;
  FINISH_STEP = 2;

  handleChange = field => (event) => {
    this.setState({ [field]: event.target.value });
  };

  onCreateTransaction = () => {
    // TODO: Improve validations
    if (this.state && this.state.to && this.state.amount) {
      this.setState({
        activeStep: this.CONFIRM_STEP
      });
    }
  }

  onConfirm = submitPromise => () => {
    this.setState({
      activeStep: this.FINISH_STEP,
      loading: true
    });
    submitPromise(this.state)
    .then(() => {
      this.setState({
        loading: false,
        error: undefined
      });
    })
    .catch((error) => {
      console.error('[SendAdaForm.handleSubmit] Errors', error);
      this.setState({
        loading: false,
        error
      });
    });
  }

  onFinish = () => {
    this.setState({
      to: '',
      amount: '',
      activeStep: this.CREATE_STEP
    });
  }

  getCreatePage = () => {
    return ([
      <div className={style.formSubContainer}>
        <div>
          <TextField
            label="To"
            margin="normal"
            value={this.state.to}
            onChange={this.handleChange('to')}
            fullWidth
          />
        </div>
        <div>
          <TextField
            label="Amount"
            margin="normal"
            value={this.state.amount}
            onChange={this.handleChange('amount')}
            fullWidth
          />
        </div>
      </div>,
      <div className={style.sendButton}>
        <Button variant="fab" color="primary" onClick={() => this.onCreateTransaction()}>
          <Send />
        </Button>
      </div>
    ]);
  }

  getConfirmPage = (submitPromise) => {
    // FIXME: From param is wrong!
    return ([
      <div className={style.formSubContainer}>
        <Typography variant="subheading">To</Typography>
        <Typography variant="body2" color="textSecondary">{this.state.to}</Typography>
        <Typography variant="subheading">From</Typography>
        <Typography variant="body2" color="textSecondary">{this.state.to}</Typography>
        <Typography variant="subheading">Amount</Typography>
        <Typography variant="body2" color="textSecondary">
          <NumberFormat thousandSeparator value={this.state.amount} displayType="text" suffix=" ADA" />
        </Typography>
      </div>,
      <div className={style.sendButton} >
        <Button className={style.sendButton} variant="fab" color="primary" onClick={() => this.onConfirm(submitPromise)()}>
          <Check />
        </Button>
      </div>
    ]);
  }

  getLoadingComponent = () => {
    return (
      <div className={style.loading}>
        <Typography variant="display3">...</Typography>
      </div>
    );
  }

  getTransactionErrorPage = () => {
    return ([
      <div className={style.loading}>
        <Typography variant="subheading">An Error occurred</Typography>
      </div>,
      <div className={style.sendButton} >
        <Button className={style.sendButton} variant="fab" color="primary" onClick={() => this.onFinish()}>
          <Refresh />
        </Button>
      </div>
    ]);
  }

  getTransactionOkPage = () => {
    return ([
      <div className={style.loading}>
        <Typography variant="subheading">Transaction successfully sent!</Typography>
      </div>,
      <div className={style.sendButton} >
        <Button className={style.sendButton} variant="fab" color="primary" onClick={() => this.onFinish()}>
          <Check />
        </Button>
      </div>
    ]);
  }

  render() {
    return (
      <List>
        <ListItem className={style.container}>
          <div className={style.formContainer}>
            <Stepper className={style.stepper} activeStep={this.state.activeStep} alternativeLabel>
              {
                this.getSteps().map((label) => {
                  return (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  );
                })
              }
            </Stepper>
            { this.state.activeStep === this.CREATE_STEP &&
              this.getCreatePage()}

            { this.state.activeStep === this.CONFIRM_STEP &&
              this.getConfirmPage(this.props.submitPromise)}

            { this.state.activeStep === this.FINISH_STEP &&
              this.state.loading && this.getLoadingComponent() }

            { this.state.activeStep === this.FINISH_STEP &&
              !this.state.loading && this.state.error && this.getTransactionErrorPage() }

            { this.state.activeStep === this.FINISH_STEP &&
              !this.state.loading && !this.state.error && this.getTransactionOkPage() }
          </div>
        </ListItem>
      </List>
    );
  }
}

SendAdaForm.propTypes = {
  submitPromise: PropTypes.func
};

export default SendAdaForm;
