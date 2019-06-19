// @flow
// Extended version of Checkbox component from react-polymorph (simple skin)
import React from 'react';
import type { Element } from 'react';
// external libraries
import classnames from 'classnames';
import { pickDOMProps } from 'react-polymorph/lib/utils/props';
import ReactMarkdown from 'react-markdown';
import styles from './CheckboxOwnSkin.scss';

type Props = {
  checked: boolean,
  className: string,
  disabled: boolean,
  onChange: Function,
  label: string | Element<any>,
  description: string | Element<any>,
  theme: Object,
  themeId: string
};

export const CheckboxOwnSkin = (props: Props) => (
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
        props.checked ? props.theme[props.themeId].checked : null
      ])}
    />
    <div
      className={styles.checkboxWrapper}
    >
      {props.label && (
        // eslint-disable-next-line
        <label className={props.theme[props.themeId].label}>
          {props.label}
        </label>
      )}
      {props.description && (
        <ReactMarkdown source={props.description} escapeHtml={false} />
      )}
    </div>
  </div>
);
