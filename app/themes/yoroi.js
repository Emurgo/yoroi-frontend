// @flow

import SimpleAutocomplete from 'react-polymorph/lib/themes/simple/SimpleAutocomplete.scss';
import SimpleBubble from 'react-polymorph/lib/themes/simple/SimpleBubble.scss';
import SimpleButton from 'react-polymorph/lib/themes/simple/SimpleButton.scss';
import SimpleCheckbox from 'react-polymorph/lib/themes/simple/SimpleCheckbox.scss';
import SimpleFormField from 'react-polymorph/lib/themes/simple/SimpleFormField.scss';
import SimpleInput from 'react-polymorph/lib/themes/simple/SimpleInput.scss';
import SimpleModal from 'react-polymorph/lib/themes/simple/SimpleModal.scss';
import SimpleOptions from 'react-polymorph/lib/themes/simple/SimpleOptions.scss';
import SimpleSelect from 'react-polymorph/lib/themes/simple/SimpleSelect.scss';
import SimpleSwitch from 'react-polymorph/lib/themes/simple/SimpleSwitch.scss';
import SimpleTextArea from 'react-polymorph/lib/themes/simple/SimpleTextArea.scss';

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
  [AUTOCOMPLETE]: SimpleAutocomplete,
  [BUBBLE]: SimpleBubble,
  [BUTTON]: SimpleButton,
  [CHECKBOX]: SimpleCheckbox,
  [FORM_FIELD]: SimpleFormField,
  [INPUT]: SimpleInput,
  [MODAL]: SimpleModal,
  [OPTIONS]: SimpleOptions,
  [SELECT]: SimpleSelect,
  [SWITCH]: SimpleSwitch,
  [TEXT_AREA]: SimpleTextArea,
};

// // react-polymorph components
// import SimpleOldFormField from './simpleOld/SimpleOldFormField.scss';
// import SimpleOldInput from './simpleOld/SimpleOldInput.scss';
// import SimpleOldCheckbox from './simpleOld/SimpleOldCheckbox.scss';
// import SimpleOldSwitch from './simpleOld/SimpleOldSwitch.scss';
// import SimpleOldModal from './simpleOld/SimpleOldModal.scss';
// import SimpleOldButton from './simpleOld/SimpleOldButton.scss';
// import SimpleOldTextArea from './simpleOld/SimpleOldTextArea.scss';
// import SimpleOldAutocomplete from './simpleOld/SimpleOldAutocomplete.scss';
// import SimpleOldBubble from './simpleOld/SimpleOldBubble.scss';
// import SimpleOldOptions from './simpleOld/SimpleOldOptions.scss';
// import SimpleOldSelect from './simpleOld/SimpleOldSelect.scss';

// // react-polymorph renewed components
// import SimpleFormField from './simple/SimpleFormField.scss';
// import SimpleInput from './simple/SimpleInput.scss';
// import SimpleCheckbox from './simple/SimpleCheckbox.scss';
// import SimpleSwitch from './simple/SimpleSwitch.scss';
// import SimpleModal from './simple/SimpleModal.scss';
// import SimpleButton from './simple/SimpleButton.scss';
// import SimpleTextArea from './simple/SimpleTextArea.scss';
// import SimpleAutocomplete from './simple/SimpleAutocomplete.scss';
// import SimpleBubble from './simple/SimpleBubble.scss';
// import SimpleOptions from './simple/SimpleOptions.scss';
// import SimpleSelect from './simple/SimpleSelect.scss';

// // package all our overrides into one theme
// export const yoroiTheme = (theme) => (theme === 'yoroi' ? ({
//   [FORM_FIELD]: SimpleFormField,
//   [INPUT]: SimpleInput,
//   [MODAL]: SimpleModal,
//   [OPTIONS]: SimpleOptions,
//   [SELECT]: SimpleSelect,
//   [AUTOCOMPLETE]: SimpleAutocomplete,
// }) : ({
//   [FORM_FIELD]: SimpleOldFormField,
//   [INPUT]: SimpleOldInput,
//   [CHECKBOX]: SimpleOldCheckbox,
//   [SWITCH]: SimpleOldSwitch,
//   [MODAL]: SimpleOldModal,
//   [BUTTON]: SimpleOldButton,
//   [TEXT_AREA]: SimpleOldTextArea,
//   [BUBBLE]: SimpleOldBubble,
//   [OPTIONS]: SimpleOldOptions,
//   [SELECT]: SimpleOldSelect,
//   [AUTOCOMPLETE]: SimpleOldAutocomplete,
// }));
