# Running Yoroi

This is assuming you've built the code.

## Run Yoroi Chrome extension

1. Open new webpage with `chrome://extensions`
2. Turn on the developer mode (checkbox in the top right-hand corner)
3. Press [Load unpacked](https://developer.chrome.com/extensions/getstarted#unpacked)
4. Select either `dev` or `build` folder (depending which `npm` command you ran)

_Note_: `dev` should hot reload on code change

## Run Yoroi Firefox extension

Debug builds for Firefox require the [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=firefox-devtools.vscode-firefox-debug) addon.

You can use the following config in `vscode/.launch.json` to launch the debugger.

```json
{
  "type": "firefox",
  "request": "launch",
  "reAttach": true,
  "name": "Launch add-on",
  "addonPath": "${workspaceFolder}/dev/",
  "preferences": {
    "security.csp.enable": false
  },
  "pathMappings": [
    {
      "url": "webpack:///",
      "path": "${workspaceFolder}/"
    }
  ]
},
```
