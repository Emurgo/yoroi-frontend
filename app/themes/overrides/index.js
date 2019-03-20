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

import AutocompleteOverridesClassic from './AutocompleteOverridesClassic.scss';
import BubbleOverridesClassic from './BubbleOverridesClassic.scss';
import ButtonOverridesClassic from './ButtonOverridesClassic.scss';
import CheckboxOverridesClassic from './CheckboxOverridesClassic.scss';
import FormFieldOverridesClassic from './FormFieldOverridesClassic.scss';
import InputOverridesClassic from './InputOverridesClassic.scss';
import ModalOverridesClassic from './ModalOverridesClassic.scss';
import OptionsOverridesClassic from './OptionsOverridesClassic.scss';
import SelectOverridesClassic from './SelectOverridesClassic.scss';
import SwitchOverridesClassic from './SwitchOverridesClassic.scss';

import { THEMES } from '../index';

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

export const themeOverrides = (theme) => (theme === THEMES.YOROI_MODERN ? ({
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
  [AUTOCOMPLETE]: AutocompleteOverridesClassic,
  [BUBBLE]: BubbleOverridesClassic,
  [BUTTON]: ButtonOverridesClassic,
  [CHECKBOX]: CheckboxOverridesClassic,
  [FORM_FIELD]: FormFieldOverridesClassic,
  [INPUT]: InputOverridesClassic,
  [MODAL]: ModalOverridesClassic,
  [OPTIONS]: OptionsOverridesClassic,
  [SELECT]: SelectOverridesClassic,
  [SWITCH]: SwitchOverridesClassic,
}));
