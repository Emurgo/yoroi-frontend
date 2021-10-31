# Theming

Yoroi uses [Material-UI](https://mui.com) to build our design system, and customize a variety of foundational and advanced components.

MUI provides us a `ThemeProvider` component that takes a [theme](https://mui.com/customization/theming/) where we can define colors, typography, shadows, spacing, and all of our design aspects to keep consistency.

> **_NOTE:_**  We should be in sync with the Design Guidelines and have the same design tokens names.

### Styling

Currently, we are using `Global styles overrides` technique as our first option to customize built-in components, [see how this works](https://mui.com/customization/theme-components/) using `styleOverrides` key. It helps us to change styles, default props, add new variants and so on. They are defined in the `overrides` folder.

As a second option to customize custom components, use `sx` prop [(see more)](https://mui.com/system/the-sx-prop/) or `styled` [(see more)](https://mui.com/system/styled/). They both have access to the theme object internally.
Foundational components are defined in the `components/common` directory.

> **_NOTE:_**  The `sx` prop offers a lot of flexibility in the API and it ensures that only the used CSS on the page is sent to the client.


### Add a new theme
First, we define a new theme in the `themes` folder using `createTheme` from MUI and it can be merged with some common settings from `common-theme` using `deepmerge` from mui-utils, if needed.

Now, we need to verify that all your design tokens are matched with our CSS Variables.
**Note**: It has to be done manually meanwhile MUI v5.1 is coming up. [See more](https://github.com/mui-org/material-ui/issues/27651).

All of CSS variables should be prefix with `--yoroi` so we can verify that belongs to Yoroi and it's not coming from any other third library.

Eg: We add a new token design in `palette.background.footer` in our theme object so we need to parse it to `--yoroi-palette-background-footer` and add it as a CSS Variables in `globalStyles.js` at the `:root` level.

```js
":root": {
  // ...
  '--yoroi-palette-background-footer' : theme.palette.background.footer,
  /*  If this color already exists, check it if we can reuse it from the palette colors */
  '--yoroi-palette-background-footer' : 'var(--yoroi-palette-secondary-300)',
  // ...
}
```
Most of CSS variables are used for colors and measurements. As a result, it will allow users to override CSS variables from the palette options or they can go deep to change colors for each component.

Finally, all of your CSS variables are loaded according to your theme so you can use them anywhere in the app.

 > **_NOTE:_**  We don't support any font tokens because it can be set from the browser, so just make sure you're using `rem` unit for fonts.
