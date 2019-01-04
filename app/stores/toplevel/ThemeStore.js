// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';

export default class ThemeStore extends Store {
  @observable old = false;

  setup() {
    this.actions.theme.changeTheme.listen(this._updateTheme);
  }

  @action _updateTheme = (
    { theme }: { theme: boolean }
  ): void => {
    this.old = theme;
  };
}
