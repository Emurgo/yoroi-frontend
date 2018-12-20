import {
    SELECT, INPUT, FORM_FIELD, CHECKBOX, SWITCH, MODAL,
    BUTTON, TEXT_AREA, AUTOCOMPLETE, OPTIONS, BUBBLE
  } from 'react-polymorph/lib/skins/simple/identifiers';
  
  // react-polymorph components
  import SimpleFormField from './simpleRenewed/SimpleFormField.scss';
  import SimpleInput from './simpleRenewed/SimpleInput.scss';
  import SimpleCheckbox from './simpleRenewed/SimpleCheckbox.scss';
  import SimpleSwitch from './simpleRenewed/SimpleSwitch.scss';
  import SimpleModal from './simpleRenewed/SimpleModal.scss';
  import SimpleButton from './simpleRenewed/SimpleButton.scss';
  import SimpleTextArea from './simpleRenewed/SimpleTextArea.scss';
  import SimpleAutocomplete from './simpleRenewed/SimpleAutocomplete.scss';
  import SimpleBubble from './simpleRenewed/SimpleBubble.scss';
  import SimpleOptions from './simpleRenewed/SimpleOptions.scss';
  import SimpleSelect from './simpleRenewed/SimpleSelect.scss';
  
  // package all our overrides into one theme
  export const yoroiRenewedTheme = {
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