// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SubMenuItem.scss';
import { Box, Typography } from '@mui/material';
import { withLayout } from '../../styles/context/layout';

type Props = {|
  +label: string,
  +active: boolean,
  +onClick: void => void,
  +className: string,
  +disabled?: boolean,
  locationId: string,
|};

type InjectedProps = {| +isRevampLayout: boolean |};

@observer
class SubMenuItem extends Component<Props & InjectedProps> {
  static defaultProps: {| disabled: boolean |} = {
    disabled: false,
  };

  render(): Node {
    const { label, active, disabled, onClick, className, locationId } = this.props;
    let state = styles.enabled;
    if (disabled === true) {
      state = styles.disabled;
    }
    const componentClasses = classNames([styles.component, state, className]);
    const componentClassesArr = componentClasses.split(' ');
    const lastClass = componentClassesArr[componentClassesArr.length - 1];
    const subMenuItemId = lastClass.toLowerCase().replace(/[ \/]/gi, '');

    return (
      <Box
        sx={getStyles(active)}
        component="button"
        className={componentClasses}
        disabled={disabled}
        onClick={onClick}
        id={locationId + '-' + subMenuItemId + 'SubTab-button'}
      >
        <Typography variant="body1" fontWeight={500}>
          {label}
        </Typography>
      </Box>
    );
  }
}

function getStyles(active: boolean): Object {
  let componentStyles = {};
  if (active) {
    componentStyles = {
      borderBottomColor: 'ds.text_primary_medium',
      borderBottom: '2px solid',
      color: 'ds.text_primary_medium',
      ':hover': {
        borderBottomColor: 'ds.text_primary_max',
        color: 'ds.text_primary_max',
      }
    };
  } else {
    componentStyles = {
      color: 'ds.text_gray_low',
      ':hover': {
        color: 'ds.text_gray_medium',
      }
    };
  }

  return {
    ...componentStyles,
    marginRight: '24px',
    padding: '6px 0px',
    textAlign: 'left',
    ':focus': {
      outlineColor: 'ds.sys_yellow_500',
      outlineWidth: '2px',
      outlineStyle: 'solid',
    },
    '&.Mui-disabled': {
      color: 'ds.text_gray_min',
      borderBottomColor: active ? 'ds.el_gray_min' : 'transparent',
    },
  };
}

export default (withLayout(SubMenuItem): ComponentType<Props>);
