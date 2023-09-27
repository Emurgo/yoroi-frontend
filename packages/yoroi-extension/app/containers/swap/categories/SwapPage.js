// @flow
import type { Node } from 'react';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Component } from 'react';
import { intlShape } from 'react-intl';

type GeneratedData = typeof SwapPage.prototype.generated;

export default class SwapPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return <>Swap form here</>;
  }
}
