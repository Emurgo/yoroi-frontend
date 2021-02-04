// // @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, observable, runInAction } from 'mobx';
import { intlShape } from 'react-intl';
import config from '../../config';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Notification } from '../../types/notificationType';
import SignTxPage from '../components/signin/SignTxPage';
import { getWalletsInfo } from '../../../chrome/extension/background';

let message;
window.chrome.runtime.sendMessage({ type: 'tx_sign_window_retrieve_data' }, response => {
  if (response == null) return;
  message = response;
});

type Props = {||};
type State = {|
  accounts: Array<Object>,
  loading: 'idle' | 'pending' | 'success' | 'rejected',
  error: string,
|};
@observer
export default class SignTxContainer extends Component<any, State> {
  @observable notificationElementId: string = '';

  state: State = {
    loading: 'idle',
    error: '',
    accounts: [],
  };

  componentDidMount() {
    getWalletsInfo()
      // eslint-disable-next-line promise/always-return
      .then(data => {
        this.setState({ loading: 'success', accounts: data });
      })
      .catch(err => {
        this.setState({ loading: 'rejected', error: err.message });
      });
  }

  onConfirm: string => void = walletPassword => {
    const sign = message?.sign ?? '';
    const tabId = message?.tabId ?? '';
    window.chrome.runtime.sendMessage({
      type: 'sign_confirmed',
      tx: sign.tx,
      uid: sign.uid,
      tabId,
      pw: walletPassword,
    });
  };
  onCancel: () => void = () => {};

  render(): Node {
    const type = message?.sign?.type ?? '';
    const txData = message?.sign?.tx ?? '';

    const { loading, error, accounts } = this.state;
    const actions = this.generated.actions;
    const { uiNotifications } = this.generated.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const notification = uiNotifications.getTooltipActiveNotification(this.notificationElementId);

    let component = null;
    // TODO: handle other sign types
    switch (type) {
      case 'tx':
        component = (
          <SignTxPage
            onCopyAddressTooltip={elementId => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={notification}
            loading={loading}
            error={error}
            accounts={accounts}
            txData={txData}
            onConfirm={this.onConfirm}
            onCancel={this.onCancel}
          />
        );
        break;

      default:
        component = null;
    }

    return <>{component}</>;
  }

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
      notifications: {|
        closeActiveNotification: {|
          trigger: (params: {| id: string |}) => void,
        |},
        open: {| trigger: (params: Notification) => void |},
      |},
    |},
    stores: {|
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean,
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean,
      |},
      wallets: {| selected: null | PublicDeriver<> |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SignTxContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
      },
      actions: {
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
        notifications: {
          closeActiveNotification: {
            trigger: actions.notifications.closeActiveNotification.trigger,
          },
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
      },
    });
  }
}
