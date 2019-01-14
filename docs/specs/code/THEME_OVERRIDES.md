# Abstract

Provide an easy way to import theme (coloring) overrides

# Motivation

Some members of the community may want to create custom color themes for Yoroi either for personal use or to share with the community. Currently, editing the current theme and sending it to others is fairly easy. However, these themes do not persist when a user reloads the page. 

# Background

Chrome supports a fairly complete set of tools that allow users to edit the existing color theme inside Yoroi. Since Yoroi saves all theme variables inside `element.style` we can use these tools fairly easily. Chrome has an article about all the features supported [here](https://developers.google.com/web/tools/chrome-devtools/css/reference#color-picker) but I will summarize those related to Yoroi:

## Editing existing theme

You can edit the `theme` variables directly and have the update on all elements.

![image](https://user-images.githubusercontent.com/2608559/49336570-02cf0500-f648-11e8-82ac-05cf76eba284.png)

![image](https://i0.wp.com/samrueby.com/wp-content/uploads/2014/10/Chrome-Colorpicker.gif)

## Exporting theme

Simply select all of `element.style` and copy it somewhere.

## Importing theme

Unfortunately Chrome doesn't allow users to directly delete a CSS selectors and you have to delete the theme from the HTML instead. Here is a gif of me "exporting" (copying) a theme, deleting my current theme and then "importing" (pasting) the theme back.

![reload theme](https://user-images.githubusercontent.com/2608559/49336988-4ed17800-f64f-11e8-80a1-cffa3a896ba3.gif)

## Persistance

Edits to the theme as described above will disappear once the page is reloaded. There are plugins and built-in features that allow you to make edits ("overrides") persistent.

# Proposal

## Persistance

To complete the feature, all we really need to do is solve the problem of persistance. Notably, we need to make a CSS change persistent in a way that will not break future Yoroi updates (for example if we add a new feature that introduces a new component with a new color, the user should see the new color as-is until they upgrade their override)

Therefore, I suggest on the `themes` sub-menu, we have a button to save the current `element.style` to `localcache`. On app load, we will check `localcache` for any saved theme and merge it into the default theme. This way, if the default theme is updated with new keys, they will still exist after the merge.

## Change theme preview to be dynamically generated

Daedalus allows you to preview custom themes before selecting them. The themes are saved pre-built `png` images
![image](https://user-images.githubusercontent.com/2608559/49337110-3bbfa780-f651-11e8-868c-eb081c6404d1.png)

I propose we instead use a single `svg` images and at runtime we swap the colors on the images with the colors for the corresponding theme. 

### Advantages

- We don't need to introduce a custom loader for `png` files to our application
- Allows us to display a preview of the user's current custom theme
- No need for a new image for every prebuilt theme we create

### Disadvantages

- You have to load all themes just to render these images
- Generating images at runtime has a performance cost (although they can be cached in a session with a memory cost)