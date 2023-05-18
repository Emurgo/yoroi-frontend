// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import EnableCatalystPage from '../components/catalyst/EnableCatalystPage';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type { EnableCatalystMessage } from '../../../chrome/extension/connector/types.js';

type GeneratedData = typeof EnableCatalystContainer.prototype.generated;

@observer
export default class EnableCatalystContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>
> {
  componentDidMount() {
    window.addEventListener('unload', this.onUnload);
  }

  onUnload: () => void = () => {
    this.onConfirm(false);
  }

  onConfirm(enable: boolean) {
    window.removeEventListener('unload', this.onUnload);
    this.generated.actions.connector.enableCatalyst.trigger(enable);
  }

  render(): Node {
    const { enableCatalystMessage } = this.generated.stores.connector;
    if (enableCatalystMessage == null) {
      return null;
    }

    return (
      <EnableCatalystPage
        favicon={enableCatalystMessage.favicon}
        url={enableCatalystMessage.requesterUrl}
        onConfirm={this.onConfirm.bind(this)}
      />
    );      
  }

  @computed get generated(): {|
    actions: {|
      connector: {|
        enableCatalyst: {| trigger: (enable: boolean) => void |},
      |},
    |},
    stores: {|
      connector: {|
        enableCatalystMessage: ?EnableCatalystMessage,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(EnableCatalystContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        connector: {
          enableCatalystMessage: stores.connector.enableCatalystMessage,
        },
      },
      actions: {
        connector: {
          enableCatalyst: { trigger: actions.connector.enableCatalyst.trigger },
        },
      },
    });
  }
}
