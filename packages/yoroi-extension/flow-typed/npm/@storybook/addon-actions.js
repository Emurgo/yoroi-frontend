// @flow
declare module '@storybook/addon-actions' {
  declare function action(string): ((...args: any[]) => void);
}
