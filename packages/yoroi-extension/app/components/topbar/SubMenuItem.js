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
    const { label, active, disabled, onClick, className, isRevampLayout, locationId } = this.props;
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
        sx={getStyles(active, isRevampLayout)}
        component="button"
        className={componentClasses}
        disabled={disabled}
        onClick={onClick}
        id={locationId + '-' + subMenuItemId + 'SubTab-button'}
      >
        <Typography
          variant="body1"
          fontWeight="500"
          color={active ? 'primary.500' : 'grayscale.600'}
        >
          {label}
        </Typography>
      </Box>
    );
  }
}

function getStyles(active: boolean, isRevampLayout: boolean): Object {
  if (isRevampLayout && active)
    return {
      borderBottomColor: 'primary.600',
      color: 'primary.600',
      ':hover': {
        borderBottomColor: 'primary.600',
        color: 'primary.600',
      },
      fontWeight: 500,
      marginRight: '24px',
    };

  if (!isRevampLayout && active)
    return {
      borderBottomColor: 'var(--yoroi-palette-secondary-300)',
      color: 'var(--yoroi-palette-secondary-300)',
      ':hover': {
        color: 'var(--yoroi-palette-secondary-300)',
        borderBottomColor: 'var(--yoroi-palette-secondary-300)',
      },
      fontWeight: 500,
      marginRight: '43px',
    };

  if (isRevampLayout)
    return {
      fontWeight: 500,
      marginRight: '24px',
    };

  return {
    marginRight: '43px',
    fontWeight: 500,
  };
}

export default (withLayout(SubMenuItem): ComponentType<Props>);
