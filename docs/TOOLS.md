# Debug tools

- React devtools (Do NOT download the Chrome extension version. It will not work)
    - `npm install -g react-devtools` to install and `react-devtools` to run

# Visual Studio Code

## Suggested extensions

- [Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Github PRs](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github)
- [Git Lens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)


## Fix Flow types not recognized

- Download the [Flow plugin](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode) for VS Code and change the following workspace settings:
1) `javascript.validate.enable` to `false`
1) `flow.useNPMPackagedFlow` to `true`
