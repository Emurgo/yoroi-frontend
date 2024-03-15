// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import TextField from '../../common/TextField';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import styles from './InlineEditingInput.scss';
import config from '../../../config';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { withLayout } from '../../../styles/context/layout';
import type { InjectedLayoutProps } from '../../../styles/context/layout';

const messages = defineMessages({
  change: {
    id: 'inline.editing.input.change.label',
    defaultMessage: '!!!change',
  },
  cancel: {
    id: 'inline.editing.input.cancel.label',
    defaultMessage: '!!!cancel',
  },
  changesSaved: {
    id: 'inline.editing.input.changesSaved',
    defaultMessage: '!!!Your changes have been saved',
  },
});

type Props = {|
  +className?: string,
  +isActive: boolean,
  +inputFieldLabel: string,
  +inputFieldValue: string,
  +onStartEditing: void => void,
  +onStopEditing: void => void,
  +onCancelEditing: void => void,
  +onSubmit: string => PossiblyAsync<void>,
  +isValid: string => boolean,
  +validationErrorMessage: string,
  +successfullyUpdated: boolean,
  +classicTheme: boolean,
  id: string,
|};

type State = {|
  isActive: boolean,
|};

@observer
class InlineEditingInput extends Component<Props & InjectedLayoutProps, State> {
  static defaultProps: {| className: void |} = {
    className: undefined,
  };

  state: State = {
    isActive: false,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  validator: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        inputField: {
          value: this.props.inputFieldValue,
          validators: [
            ({ field }) => [this.props.isValid(field.value), this.props.validationErrorMessage],
          ],
        },
      },
    },
    {
      options: {
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  submit: () => void = () => {
    this.validator.submit({
      onSuccess: async form => {
        const { inputField } = form.values();
        if (inputField !== this.props.inputFieldValue) {
          await this.props.onSubmit(inputField);
          this.props.onStopEditing();
        } else {
          this.props.onCancelEditing();
        }
        this.setState({ isActive: false });
      },
    });
  };

  handleInputKeyDown: (event: KeyboardEvent) => void = (event: KeyboardEvent) => {
    if (event.which === 13) {
      // ENTER key
      this.onBlur();
    }
    if (event.which === 27) {
      // ESCAPE key
      this.onCancel();
    }
  };

  onFocus: () => void = () => {
    this.setState({ isActive: true });
    this.props.onStartEditing();
  };

  onBlur: () => void = () => {
    if (this.state.isActive) {
      this.submit();
      this.inputField.blur();
    }
  };

  onCancel: () => void = () => {
    const inputField = this.validator.$('inputField');
    inputField.value = this.props.inputFieldValue;
    this.setState({ isActive: false });
    this.props.onCancelEditing();
    this.inputField.blur();
  };

  componentDidUpdate(): void {
    if (this.props.isActive && this.inputField) {
      this.inputField.focus();
    }
  }

  // $FlowFixMe[value-as-type]
  inputField: TextField;

  render(): Node {
    const { validator } = this;
    const { className, inputFieldLabel, isActive, successfullyUpdated, id } = this.props;
    const { intl } = this.context;
    const inputField = validator.$('inputField');
    const componentStyles = classnames([
      className,
      styles.component,
      isActive ? null : styles.inactive,
      inputField.error && styles.error,
    ]);
    const inputStyles = classnames([
      successfullyUpdated ? 'input_animateSuccess' : null,
      isActive ? null : 'input_cursorPointer',
    ]);

    return (
      <div
        className={componentStyles}
        onBlur={this.onBlur}
        onClick={this.onFocus}
        role="presentation"
        aria-hidden
      >
        <TextField
          className={inputStyles}
          type="text"
          {...inputField.bind()}
          label={inputFieldLabel}
          value={inputField.value}
          onChange={inputField.onChange}
          onKeyDown={event => this.handleInputKeyDown(event)}
          error={inputField.value.length === 0 || inputField.value.length > 40 ? inputField.error : ''}
          inputRef={input => {
            this.inputField = input;
          }}
          id={id + '-editValue-input'}
          onFocus={event => {
            event.target.select();
          }}
        />

        {successfullyUpdated && (
          <div className={styles.savingResultLabel}>
            {intl.formatMessage(messages.changesSaved)}
          </div>
        )}
      </div>
    );
  }
}

export default (withLayout(InlineEditingInput): ComponentType<Props>);
