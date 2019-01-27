import { IDENTIFIERS } from 'react-polymorph/lib/themes/API';
import AutocompleteOverrides from './AutocompleteOverrides.scss';
import ButtonOverrides from './ButtonOverrides.scss';
import CheckboxOverrides from './CheckboxOverrides.scss';
import FormFieldOverrides from './FormFieldOverrides.scss';
import InputOverrides from './InputOverrides.scss';
import ModalOverrides from './ModalOverrides.scss';
import OptionsOverrides from './OptionsOverrides.scss';
import SelectOverrides from './SelectOverrides.scss';
import SwitchOverrides from './SwitchOverrides.scss';

const {
  AUTOCOMPLETE,
  BUTTON,
  CHECKBOX,
  FORM_FIELD,
  INPUT,
  MODAL,
  OPTIONS,
  SELECT,
  SWITCH
} = IDENTIFIERS;

export const themeOverrides = {
  [AUTOCOMPLETE]: AutocompleteOverrides,
  [BUTTON]: ButtonOverrides,
  [CHECKBOX]: CheckboxOverrides,
  [FORM_FIELD]: FormFieldOverrides,
  [INPUT]: InputOverrides,
  [MODAL]: ModalOverrides,
  [OPTIONS]: OptionsOverrides,
  [SELECT]: SelectOverrides,
  [SWITCH]: SwitchOverrides,
};
