// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { ComplexityLevelType } from '../../types/complexityLevelType';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { ComplexityLevels } from '../../types/complexityLevelType';
import WarningBox from '../../components/widgets/WarningBox';

import DangerousActionDialog from '../../components/widgets/DangerousActionDialog';

export type GeneratedData = typeof DeregisterDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onNext: void => void,
  +alwaysShowDeregister: boolean,
|};

const dialogMessages = defineMessages({
  title: {
    id: 'wallet.transfer.deregister.title',
    defaultMessage: '!!!Also deregister the staking key?',
  },
  deregisterOption: {
    id: 'wallet.transfer.deregister.deregister',
    defaultMessage: '!!!Deregister',
  },
  keep: {
    id: 'wallet.transfer.deregister.keep',
    defaultMessage: '!!!Keep registered',
  },
  deregisterExplanationLine1: {
    id: 'wallet.transfer.deregister.line1',
    defaultMessage:
      '!!!When withdrawing rewards, you also have the option to deregister the staking key',
  },
  deregisterExplanationLine2: {
    id: 'wallet.transfer.deregister.line2',
    defaultMessage:
      '!!!Deregistering the staking key will give you back your deposit and undelegate the key from any pool',
  },
  deregisterExplanationLine3: {
    id: 'wallet.transfer.deregister.line3',
    defaultMessage:
      '!!!Keeping the staking key will allow you to withdraw the rewards, but continue delegating to the same pool',
  },
  noNeedToDeregister: {
    id: 'wallet.transfer.deregister.noNeedToDeregister',
    defaultMessage: `!!!You do NOT need to deregister to delegate to a different stake pool. You can change your delegation preference at any time`,
  },
  deregisterExplanationLine4: {
    id: 'wallet.transfer.deregister.line4',
    defaultMessage: `!!!You should NOT deregister if this staking key is used as a stake pool's reward account, as this will cause all pool operator rewards to be sent back to the reserved`,
  },
  deregisterExplanationLine5: {
    id: 'wallet.transfer.deregister.line5',
    defaultMessage: `!!!Deregistering means this key will no longer receive rewards until you re-register the staking key (usually by delegating to a pool again)`,
  },
});

@observer
export default class DeregisterDialogContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    this.generated.actions.ada.delegationTransaction.setShouldDeregister.trigger(false);
    if (
      this.props.alwaysShowDeregister === false &&
      this.generated.stores.profile.selectedComplexityLevel !== ComplexityLevels.Advanced
    ) {
      this.props.onNext();
    }
  }

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    this.isChecked = !this.isChecked;
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <DangerousActionDialog
        title={intl.formatMessage(dialogMessages.title)}
        checkboxAcknowledge={intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        secondaryButton={{
          label: intl.formatMessage(dialogMessages.keep),
          onClick: () => {
            this.generated.actions.ada.delegationTransaction.setShouldDeregister.trigger(false);
            this.props.onNext();
          },
          primary: true,
        }}
        onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
        primaryButton={{
          label: intl.formatMessage(dialogMessages.deregisterOption),
          onClick: () => {
            this.generated.actions.ada.delegationTransaction.setShouldDeregister.trigger(true);
            this.props.onNext();
          },
        }}
        isSubmitting={false}
        error={undefined}
      >
        <div>{intl.formatMessage(dialogMessages.deregisterExplanationLine1)}</div>
        <div>{intl.formatMessage(dialogMessages.deregisterExplanationLine3)}</div>
        <div>{intl.formatMessage(dialogMessages.deregisterExplanationLine2)}</div>
        <WarningBox>
          <ol>
            <br />
            <li>{intl.formatMessage(dialogMessages.noNeedToDeregister)}</li>
            <br />
            <li>{intl.formatMessage(dialogMessages.deregisterExplanationLine4)}</li>
            <br />
            <li>{intl.formatMessage(dialogMessages.deregisterExplanationLine5)}</li>
          </ol>
        </WarningBox>
        <br />
        <br />
      </DangerousActionDialog>
    );
  }

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
      |},
      ada: {|
        delegationTransaction: {|
          setShouldDeregister: {|
            trigger: boolean => void,
          |},
        |},
      |},
    |},
    stores: {|
      profile: {|
        selectedComplexityLevel: ?ComplexityLevelType,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(DeregisterDialogContainer)} no way to generated props`);
    }
    const { actions, stores } = this.props;
    return Object.freeze({
      stores: Object.freeze({
        profile: {
          selectedComplexityLevel: stores.profile.selectedComplexityLevel,
        },
      }),
      actions: {
        ada: {
          delegationTransaction: {
            setShouldDeregister: {
              trigger: actions.ada.delegationTransaction.setShouldDeregister.trigger,
            },
          },
        },
        dialogs: {
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }
}
