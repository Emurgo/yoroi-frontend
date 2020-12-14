// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import QRCode from 'qrcode.react';

export type GeneratedData = typeof VotingPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};

@observer
export default class VotingPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = { intl: intlShape.isRequired };

  componentDidMount(){
    this.generated.actions.generateEncryptedKey.trigger([1, 2, 3, 4]);
  }
  render(): Node {

    const qrCodeBackgroundColor = document.documentElement
      ? document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color')
      : 'transparent';
    const qrCodeForegroundColor = document.documentElement
      ? document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color')
      : '#000';
    return (
      <div>
        {
        this.generated.stores.voting.encryptedKey !== null ? (<QRCode
          value={this.generated.stores.voting.encryptedKey}
          bgColor={qrCodeBackgroundColor}
          fgColor={qrCodeForegroundColor}
          size={152}
        />) :''
        }
      </div>
    );
  }

  @computed get generated(): {|
    actions: {|
      generateEncryptedKey: {| trigger: (password: Array<number>) => Promise<void> |},
    |},
    stores: {|
      voting: {|
        encryptedKey: ?string,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(VotingPage)} no way to generated props`);
    }

    const { stores, actions } = this.props;
    const votingStore = stores.voting;
    return Object.freeze({
      actions: {
        generateEncryptedKey: { trigger: actions.ada.voting.generateEncryptedKey.trigger },
      },
      stores: {
        voting: {
          encryptedKey: votingStore.encryptedKey,
        },
      },
    });
  }
}
