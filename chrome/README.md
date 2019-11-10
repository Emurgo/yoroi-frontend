# Chrome

Yoroi runs as a one-page application that is split into two parts:

1) Background page runs continuously and manages the actual opening/closing of Yoroi on icon click
2) Main page which is the entry point into the actual application

**Note**: Assets stored in this folder are **not bundled** and should only be use in the `manifest` or cases where we need to display an image without having to load the entire application. If your asset is only used at runtime, please ues the `app/assets` folder.