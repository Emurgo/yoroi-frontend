// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { ReactComponent as BackArrow }  from '../../assets/images/back-arrow-ic.inline.svg';
import { IconButton } from '@mui/material';

type Props = {|
  +onBack: void => PossiblyAsync<void>,
|};

@observer
export default class DialogBackButton extends Component<Props> {
  render(): Node {
    const { onBack } = this.props;
    return (
      <IconButton
        onClick={onBack}
        sx={{
          position: 'absolute',
          top: '19px',
          left: '30px',
          svg: {
            width: '20px',
            height: '16px',
            path: {
              fill: 'hsl(220deg 2% 28%)',
            },
          },
        }}
      >
        <BackArrow />
      </IconButton>
    );
  }
}
