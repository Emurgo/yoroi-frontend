// @flow
// Extended version of Checkbox component from react-polymorph (simple skin)
import React from 'react';
import type { Element } from 'react';
// external libraries
import classnames from 'classnames';
import { pickDOMProps } from 'react-polymorph/lib/utils/props';
import ReactMarkdown from 'react-markdown';
import styles from './CheckboxOwnSkin.scss';

// This type should be kept open (not "exact") because it is a react-polymorph skin
// and should be able to pass any extra properties from react-polymorph down.
type Props = {
  checked: boolean,
  className: string,
  disabled: boolean,
  onChange: (boolean, Event) => void,
  label: string | Element<any>,
  description: string | Element<any>,
  theme: Object,
  themeId: string,
  showCheckInCenter: boolean,
  ...
};

/**
 * This skin provides flexibility of Checkbox icon vertical display position
 * and props.description provides option to display addition info text about the Checkbox.
 * If props.description is provided, by default Checkbox icon is displayed
 * at the top(at same lavel of the label text) and If props.showCheckInCenter is true,
 * Checkbox icon is displayed at the ceter.
 * @param {*} props
 */
export const CheckboxOwnSkin = (props: Props) => {
  let checkBlockStyleOverride;
  if (props.description) {
    checkBlockStyleOverride = props.showCheckInCenter ?
      styles.checkBlockCenter :
      styles.checkBlockTop;
  }

  return (
    <div
      role="presentation"
      aria-hidden
      className={classnames([
        props.className,
        props.theme[props.themeId].root,
        props.disabled ? props.theme[props.themeId].disabled : null,
        props.checked ? props.theme[props.themeId].checked : null
      ])}
      onClick={event => {
        if (!props.disabled && props.onChange) {
          props.onChange(!props.checked, event);
        }
      }}
    >
      <input
        {...pickDOMProps(props)}
        className={props.theme[props.themeId].input}
        type="checkbox"
      />
      <div
        className={classnames([
          props.theme[props.themeId].check,
          props.checked ? props.theme[props.themeId].checked : null,
          checkBlockStyleOverride
        ])}
      />
      <div
        className={styles.checkboxWrapper}
      >
        {props.label && (
          // eslint-disable-next-line
          <p className={classnames([
            props.theme[props.themeId].label,
            styles.labelText])}
          >
            {props.label}
          </p>
        )}
        {props.description && (
          <ReactMarkdown
            className={styles.descriptionText}
            source={props.description}
            escapeHtml={false}
          />
        )}
      </div>
    </div>);
};
