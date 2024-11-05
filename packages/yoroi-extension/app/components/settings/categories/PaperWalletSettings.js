// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';

type Props = {|
  onRedirect(): void,
|};

@observer
class PaperWalletSettings extends Component<Props> {
  render(): Node {
    const { onRedirect } = this.props;
    return (
      <div>
        <Button variant="contained" onClick={onRedirect}>
          Transfer from Paper Wallet
        </Button>
      </div>
    );
  }
}

export default PaperWalletSettings;
