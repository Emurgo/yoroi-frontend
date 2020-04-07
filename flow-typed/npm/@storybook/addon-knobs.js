// @flow
declare module '@storybook/addon-knobs' {
  declare module.exports: any;
}

// Note: this is an internal API you're not supposed to use. No guarantee it doesn't change
declare module '@storybook/addon-knobs/dist/registerKnobs' {
  declare var manager: {|
    knobStore: {|
      get<T>(name: string): {|
        defaultValue: T,
        groupId: void | string,
        label: string,
        name: string,
        options?: Array<T>,
        type: "select" | "boolean" | string,
        used: boolean,
        value: T
      |},
    |},
  |}
}
