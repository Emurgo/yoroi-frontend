// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import environment from '../../environment';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import { computed } from 'mobx';
import OptForAnalyticsForm from '../../components/profile/terms-of-use/OptForAnalyticsForm';

type GeneratedData = typeof OptForAnalyticsPage.prototype.generated;

@observer
export default class OptForAnalyticsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return (
      <>
        <IntroBanner
          isNightly={environment.isNightly()}
        />
        <OptForAnalyticsForm
          onOpt={this.generated.actions.profile.optForAnalytics.trigger}
          variant="startup"
          isOptedIn={false}
        />
      </>
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        optForAnalytics: {| trigger: (boolean) => void |},
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(OptForAnalyticsPage)} no way to generated props`);
    }
    const { actions } = this.props;
    return Object.freeze({
      actions: {
        profile: {
          optForAnalytics: { trigger: actions.profile.optForAnalytics.trigger },
        },
      },
    });
  }
}
