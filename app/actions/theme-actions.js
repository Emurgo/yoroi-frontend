// @flow
import Action from './lib/Action';

export default class ThemeActions {
  changeTheme: Action<{ theme: boolean }> = new Action();
}
