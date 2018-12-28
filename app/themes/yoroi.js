import {
  SELECT, INPUT, FORM_FIELD, CHECKBOX, SWITCH, MODAL,
  BUTTON, TEXT_AREA, AUTOCOMPLETE, OPTIONS, BUBBLE
} from 'react-polymorph/lib/skins/simple/identifiers';

// react-polymorph components
import SimpleOldFormField from './simpleOld/SimpleOldFormField.scss';
import SimpleOldInput from './simpleOld/SimpleOldInput.scss';
import SimpleOldCheckbox from './simpleOld/SimpleOldCheckbox.scss';
import SimpleOldSwitch from './simpleOld/SimpleOldSwitch.scss';
import SimpleOldModal from './simpleOld/SimpleOldModal.scss';
import SimpleOldButton from './simpleOld/SimpleOldButton.scss';
import SimpleOldTextArea from './simpleOld/SimpleOldTextArea.scss';
import SimpleOldAutocomplete from './simpleOld/SimpleOldAutocomplete.scss';
import SimpleOldBubble from './simpleOld/SimpleOldBubble.scss';
import SimpleOldOptions from './simpleOld/SimpleOldOptions.scss';
import SimpleOldSelect from './simpleOld/SimpleOldSelect.scss';

// react-polymorph renewed components
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
  [FORM_FIELD]: SimpleOldFormField,
  [INPUT]: SimpleOldInput,
  [CHECKBOX]: SimpleOldCheckbox,
  [SWITCH]: SimpleOldSwitch,
  [MODAL]: SimpleOldModal,
  [BUTTON]: SimpleOldButton,
  [TEXT_AREA]: SimpleOldTextArea,
  [BUBBLE]: SimpleOldBubble,
  [OPTIONS]: SimpleOldOptions,
  [SELECT]: SimpleOldSelect,
  [AUTOCOMPLETE]: SimpleOldAutocomplete,
}));
