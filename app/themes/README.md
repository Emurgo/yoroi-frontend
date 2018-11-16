# Folder structure

This folder serves three independent theme (css) related concepts

## 1) Overriding the default theme

Yoroi uses [React-Polymorph](https://github.com/input-output-hk/react-polymorph/) to separate the theming (style/css) of a component from its UI logic and its skin (markup).

React-Polymorph comes with a default theme for each component (called the `simple` theme) but we want to allow ourselves to easily extend/modify it as needed. To do this, we :

A) Have a folder called `simple` which imports the default themes (css) and provides us the ability to override what we need.
B) Rebundle this modified `simple` theme into a new theme called `yoroiTheme`. 
C) Use the `ThemeProvider` to automatically override the default theme on all React-Polymorph componenets at the top-level of our `App`.

## 2) Store prebuild themes

We want to allow users to switch the look of Yoroi during runtime based on a set of prebuilt themes which are defined in the `prebuilt` folder.

To add a new extension point for theming, create a new row in all the `prebuilt` files then you can refer back to it using `var(--theme-your-theme-extension-point-here);` inside `scss` files.

## 3) Store shared themes

Some themes are shared across multiple components and so we store them in a shared location called `mixins`