# Extension points

Yoroi uses [React-Polymorph](https://github.com/input-output-hk/react-polymorph/) to separate the theming (style/css) of a component from its UI logic and its skin (markup).

React-Polymorph comes with a default theme for each component (called the `simple` theme) with extension points (ex: letting you switch the color) as [`css` variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables). We also create extension points into our own application again through `css` variables.

Prefixes the `react-polymorph` css vars with `--rp` and renames them to follow a uniform naming convention that describes their use from broad to specific.
- Example: `--rp-formfield-label-text-color` and `--rp-formfield-label-text-color-disabled`.

This convention follows `--rp-prefix-component-element-property-state`.

# Folder structure

This folder serves a few independent theme (css) related concepts

## 1) Overriding the default theme

A) Have a folder called `overrides` which overrides the default properties of `simple` (to see what the defaults are, go see the `simple` theme in the [`react-polymorph` repo](https://github.com/input-output-hk/react-polymorph/tree/develop/source/themes/simple))\
B) Rebundle this modified `simple` theme into a new theme called `yoroiPolymorphTheme`.\
C) Use the `ThemeProvider` to automatically override the default theme on all React-Polymorph componenets at the top-level of our `App`.

## 2) Store prebuild themes

We want to allow users to switch the look of Yoroi during runtime based on a set of prebuilt themes which are defined in the `prebuilt` folder.

To add a new extension point for theming, create a new row in all the `prebuilt` files then you can refer back to it using `var(--theme-your-theme-extension-point-here);` inside `scss` files.

## 3) Store shared themes

Some themes are shared across multiple components and so we store them in a shared location called `mixins`. Global css overrides are put in `index.global.scss`