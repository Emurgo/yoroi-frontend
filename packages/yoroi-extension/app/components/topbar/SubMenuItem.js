// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './SubMenuItem.scss';
import { Box, Typography } from '@mui/material';

type Props = {|
  +label: string,
  +active: boolean,
  +onClick: void => void,
  +className: string,
  +disabled?: boolean,
  locationId: string,
|};

@observer
export default class SubMenuItem extends Component<Props> {
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
        <Typography variant="body1" fontWeight="500" color={active ? 'primary.500' : 'grayscale.600'}>
          {label}
        </Typography>
      </Box>
    );
  }
}

function getStyles(active: boolean): Object {
  if (active)
    return {
      borderBottomColor: 'ds.text_primary_medium',
      color: 'ds.text_primary_medium',
      ':hover': {
        borderBottomColor: 'ds.text_primary_max',
        color: 'ds.text_primary_max',
      },
      fontWeight: 500,
      marginRight: '24px',
    };

  return {
    fontWeight: 500,
    marginRight: '24px',
  };
}
