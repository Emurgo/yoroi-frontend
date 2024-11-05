// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { Button } from '@mui/material';

type Props = {|
  onRedirect(): void,
|};

@observer
class PaperWalletSettings extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

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
