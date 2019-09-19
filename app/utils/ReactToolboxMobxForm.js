// @flow
import MobxReactForm from 'mobx-react-form';

/** Custom Rewriter
 * Based off https://foxhound87.github.io/mobx-react-form/docs/bindings/custom.html */
export default class ReactToolboxMobxForm extends MobxReactForm {

  bindings() {
    return {
      ReactToolbox: {
        id: 'id',
        name: 'name',
        type: 'type',
        value: 'value',
        label: 'label',
        placeholder: 'hint',
        disabled: 'disabled',
        error: 'error',
        onChange: 'onChange',
        onFocus: 'onFocus',
        onBlur: 'onBlur',
      },
    };
  }
}
