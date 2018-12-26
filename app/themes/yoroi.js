import {
  SELECT, INPUT, FORM_FIELD, CHECKBOX, SWITCH, MODAL,
  BUTTON, TEXT_AREA, AUTOCOMPLETE, OPTIONS, BUBBLE
} from 'react-polymorph/lib/skins/simple/identifiers';

// react-polymorph components
import SimpleFormField from './simple/SimpleFormField.scss';
import SimpleInput from './simple/SimpleInput.scss';
import SimpleCheckbox from './simple/SimpleCheckbox.scss';
import SimpleSwitch from './simple/SimpleSwitch.scss';
import SimpleModal from './simple/SimpleModal.scss';
import SimpleButton from './simple/SimpleButton.scss';
import SimpleTextArea from './simple/SimpleTextArea.scss';
import SimpleAutocomplete from './simple/SimpleAutocomplete.scss';
import SimpleBubble from './simple/SimpleBubble.scss';
import SimpleOptions from './simple/SimpleOptions.scss';
import SimpleSelect from './simple/SimpleSelect.scss';

// react-polymorph renewed components
import SimpleRenewedFormField from './simpleRenewed/SimpleRenewedFormField.scss';
import SimpleRenewedInput from './simpleRenewed/SimpleRenewedInput.scss';
import SimpleRenewedCheckbox from './simpleRenewed/SimpleRenewedCheckbox.scss';
import SimpleRenewedSwitch from './simpleRenewed/SimpleRenewedSwitch.scss';
import SimpleRenewedModal from './simpleRenewed/SimpleRenewedModal.scss';
import SimpleRenewedButton from './simpleRenewed/SimpleRenewedButton.scss';
import SimpleRenewedTextArea from './simpleRenewed/SimpleRenewedTextArea.scss';
import SimpleRenewedAutocomplete from './simpleRenewed/SimpleRenewedAutocomplete.scss';
import SimpleRenewedBubble from './simpleRenewed/SimpleRenewedBubble.scss';
import SimpleRenewedOptions from './simpleRenewed/SimpleRenewedOptions.scss';
import SimpleRenewedSelect from './simpleRenewed/SimpleRenewedSelect.scss';

  // {
  //   [FORM_FIELD]: SimpleFormField,
  //   [INPUT]: SimpleInput,
  //   [CHECKBOX]: SimpleCheckbox,
  //   [SWITCH]: SimpleSwitch,
  //   [MODAL]: SimpleModal,
  //   [BUTTON]: SimpleButton,
  //   [TEXT_AREA]: SimpleTextArea,
  //   [BUBBLE]: SimpleBubble,
  //   [OPTIONS]: SimpleOptions,
  //   [SELECT]: SimpleSelect,
  //   [AUTOCOMPLETE]: SimpleAutocomplete,
  // }

// package all our overrides into one theme
export const yoroiTheme = (theme) => (theme === 'yoroi' ? ({
  [FORM_FIELD]: SimpleFormField,
  [INPUT]: SimpleInput,
  [CHECKBOX]: SimpleCheckbox,
  [SWITCH]: SimpleSwitch,
  [MODAL]: SimpleModal,
  [BUTTON]: SimpleButton,
  [TEXT_AREA]: SimpleTextArea,
  [BUBBLE]: SimpleBubble,
  [OPTIONS]: SimpleOptions,
  [SELECT]: SimpleSelect,
  [AUTOCOMPLETE]: SimpleAutocomplete,
}) : ({
  [FORM_FIELD]: SimpleRenewedFormField,
  [INPUT]: SimpleRenewedInput,
  [CHECKBOX]: SimpleRenewedCheckbox,
  [SWITCH]: SimpleRenewedSwitch,
  [MODAL]: SimpleRenewedModal,
  [BUTTON]: SimpleRenewedButton,
  [TEXT_AREA]: SimpleRenewedTextArea,
  [BUBBLE]: SimpleRenewedBubble,
  [OPTIONS]: SimpleRenewedOptions,
  [SELECT]: SimpleRenewedSelect,
  [AUTOCOMPLETE]: SimpleRenewedAutocomplete,
}));


// export const yoroiTheme = (theme) => (theme === 'yoroi' ? ({
//   [FORM_FIELD]: require('./simple/SimpleFormField.scss'),
//   [INPUT]: require('./simple/SimpleInput.scss'),
//   [CHECKBOX]: require('./simple/SimpleCheckbox.scss'),
//   [SWITCH]: require('./simple/SimpleSwitch.scss'),
//   [MODAL]: require('./simple/SimpleModal.scss'),
//   [BUTTON]: require('./simple/SimpleButton.scss'),
//   [TEXT_AREA]: require('./simple/SimpleTextArea.scss'),
//   [BUBBLE]: require('./simple/SimpleBubble.scss'),
//   [OPTIONS]: require('./simple/SimpleOptions.scss'),
//   [SELECT]: require('./simple/SimpleSelect.scss'),
//   [AUTOCOMPLETE]: require('./simple/SimpleAutocomplete.scss'),
// }) : ({
//   [FORM_FIELD]: require('./simpleRenewed/SimpleRenewedFormField.scss'),
//   [INPUT]: require('./simpleRenewed/SimpleRenewedInput.scss'),
//   [CHECKBOX]: require('./simpleRenewed/SimpleRenewedCheckbox.scss'),
//   [SWITCH]: require('./simpleRenewed/SimpleRenewedSwitch.scss'),
//   [MODAL]: require('./simpleRenewed/SimpleRenewedModal.scss'),
//   [BUTTON]: require('./simpleRenewed/SimpleRenewedButton.scss'),
//   [TEXT_AREA]: require('./simpleRenewed/SimpleRenewedTextArea.scss'),
//   [BUBBLE]: require('./simpleRenewed/SimpleRenewedBubble.scss'),
//   [OPTIONS]: require('./simpleRenewed/SimpleRenewedOptions.scss'),
//   [SELECT]: require('./simpleRenewed/SimpleRenewedSelect.scss'),
//   [AUTOCOMPLETE]: require('./simpleRenewed/SimpleRenewedAutocomplete.scss'),
// }));


// export const yoroiTheme = (theme) => {
//   console.log('theme', theme)
//   return {
//     [FORM_FIELD]: theme === 'yoroi' ? require('./simple/SimpleFormField.scss') : require('./simpleRenewed/SimpleFormField.scss'),
//     [INPUT]: theme === 'yoroi' ? require('./simple/SimpleInput.scss') : require('./simpleRenewed/SimpleRenewedInput.scss'),
//     [CHECKBOX]: theme === 'yoroi' ? require('./simple/SimpleCheckbox.scss') : require('./simpleRenewed/SimpleCheckbox.scss'),
//     [SWITCH]: theme === 'yoroi' ? require('./simple/SimpleSwitch.scss') : require('./simpleRenewed/SimpleSwitch.scss'),
//     [MODAL]: theme === 'yoroi' ? require('./simple/SimpleModal.scss') : require('./simpleRenewed/SimpleModal.scss'),
//     [BUTTON]: theme === 'yoroi' ? require('./simple/SimpleButton.scss') : require('./simpleRenewed/SimpleRenewedButton.scss'),
//     [TEXT_AREA]: theme === 'yoroi' ? require('./simple/SimpleTextArea.scss') : require('./simpleRenewed/SimpleTextArea.scss'),
//     [BUBBLE]: theme === 'yoroi' ? require('./simple/SimpleBubble.scss') : require('./simpleRenewed/SimpleBubble.scss'),
//     [OPTIONS]: theme === 'yoroi' ? require('./simple/SimpleOptions.scss') : require('./simpleRenewed/SimpleOptions.scss'),
//     [SELECT]: theme === 'yoroi' ? require('./simple/SimpleSelect.scss') : require('./simpleRenewed/SimpleSelect.scss'),
//     [AUTOCOMPLETE]: theme === 'yoroi' ? require('./simple/SimpleAutocomplete.scss') : require('./simpleRenewed/SimpleAutocomplete.scss'),
//   }
// };
