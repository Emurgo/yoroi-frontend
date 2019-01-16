import { IDENTIFIERS } from 'react-polymorph/lib/themes/API';
import AutocompleteOverrides from './AutocompleteOverrides.scss';
import BubbleOverrides from './BubbleOverrides.scss';
import ButtonOverrides from './ButtonOverrides.scss';
import CheckboxOverrides from './CheckboxOverrides.scss';
import FormFieldOverrides from './FormFieldOverrides.scss';
import InputOverrides from './InputOverrides.scss';
import ModalOverrides from './ModalOverrides.scss';
import OptionsOverrides from './OptionsOverrides.scss';
import SelectOverrides from './SelectOverrides.scss';
import SwitchOverrides from './SwitchOverrides.scss';

import AutocompleteOverridesOld from './AutocompleteOverridesOld.scss';
import BubbleOverridesOld from './BubbleOverridesOld.scss';
import ButtonOverridesOld from './ButtonOverridesOld.scss';
import CheckboxOverridesOld from './CheckboxOverridesOld.scss';
import FormFieldOverridesOld from './FormFieldOverridesOld.scss';
import InputOverridesOld from './InputOverridesOld.scss';
import ModalOverridesOld from './ModalOverridesOld.scss';
import OptionsOverridesOld from './OptionsOverridesOld.scss';
import SelectOverridesOld from './SelectOverridesOld.scss';
import SwitchOverridesOld from './SwitchOverridesOld.scss';

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
  SWITCH
} = IDENTIFIERS;

export const themeOverrides = (theme) => (theme === 'yoroi' ? ({
  [AUTOCOMPLETE]: AutocompleteOverrides,
  [BUBBLE]: BubbleOverrides,
  [BUTTON]: ButtonOverrides,
  [CHECKBOX]: CheckboxOverrides,
  [FORM_FIELD]: FormFieldOverrides,
  [INPUT]: InputOverrides,
  [MODAL]: ModalOverrides,
  [OPTIONS]: OptionsOverrides,
  [SELECT]: SelectOverrides,
  [SWITCH]: SwitchOverrides,
}) : ({
  [AUTOCOMPLETE]: AutocompleteOverridesOld,
  [BUBBLE]: BubbleOverridesOld,
  [BUTTON]: ButtonOverridesOld,
  [CHECKBOX]: CheckboxOverridesOld,
  [FORM_FIELD]: FormFieldOverridesOld,
  [INPUT]: InputOverridesOld,
  [MODAL]: ModalOverridesOld,
  [OPTIONS]: OptionsOverridesOld,
  [SELECT]: SelectOverridesOld,
  [SWITCH]: SwitchOverridesOld,
}));

// export const themeOverrides = {
//   [AUTOCOMPLETE]: AutocompleteOverrides,
//   [BUTTON]: ButtonOverrides,
//   [CHECKBOX]: CheckboxOverrides,
//   [FORM_FIELD]: FormFieldOverrides,
//   [INPUT]: InputOverrides,
//   [MODAL]: ModalOverrides,
//   [OPTIONS]: OptionsOverrides,
//   [SELECT]: SelectOverrides,
//   [SWITCH]: SwitchOverrides,
// };
