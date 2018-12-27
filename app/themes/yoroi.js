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

import { IDENTIFIERS } from 'react-polymorph/lib/themes/API';

const {
  AUTOCOMPLETE,
  BUBBLE,
  BUTTON,
  CHECKBOX,
  FORM_FIELD,
  INPUT,
  MODAL,
  OPTIONS,
  SELECT,
  SWITCH,
  TEXT_AREA,
} = IDENTIFIERS;

// package all our overrides into one theme
export const yoroiTheme = {
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
};
