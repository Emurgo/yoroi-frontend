# i18n setup

We use three libraries to handle our i18n scenario

First, `react-intl` allows us to specify translations inside `json` files and load them inside our app

However, a simple use of this library leads to passing `json` keys as strings inside your code. This makes it difficult to detect if a translation is actually used and if you're following good practices. 

To solve this, we use `babel-plugin-react-intl` which forces you to wrap the `json` keys in an special object though a `defineMessages` hook of `react-intl` inside your code that way the system can track which translations are used.

Now we can use `react-intl-translations-manager` to generate a report of our translations any any mistakes that there may be (unused strings, missing translations, etc.)

## Advantages/disadvantages with this setup

`babel-plugin-react-intl` forces us to pollute our code with all these `defineMessages` that require a default text also specified in the code. This causes duplication of the translations where it occurs in both our `json` and our source (you can see discussion about this [here](https://github.com/yahoo/babel-plugin-react-intl/issues/43)). We could fix this by wrapping `defineMessages` again with our own wrapper that removes this requirement.

Since the `defineMessages` occur inside our code, it means you have to compile the project to detect which translations are used. This makes switching branches problematic since switching branches will invalidate your `translation/messages` cache and you have to rebuild to fix it (if you call `manage-translations` before doing this, you will get bad results). To fix this, we have a custom git hook that automatically purges the cache whenever you switch branches.

One advantage is that this setup allows us to include the `translation-manager` results as part of our CI build (not done as of Oct 30th)

## How to add a new i18n text

**Warning**: You can only add / modify text for `en-US`. To modify other languages, you **must** make the change in [Crowdin](https://crowdin.com/project/yoroi-app/), otherwise Crowdin will override your changes.

Let's see an example of how to add a new i18n text. For this example let's **assume** we have the following supported locales.
1. [en-US](https://github.com/Emurgo/yoroi-frontend/blob/develop/app/i18n/locales/en-US.json)
2. [ja-JP](https://github.com/Emurgo/yoroi-frontend/blob/develop/app/i18n/locales/ja-JP.json)

The text we want to add is `I am testing i18n`

#### Steps
1. In [en-US](https://github.com/Emurgo/yoroi-frontend/blob/develop/app/i18n/locales/en-US.json) add a new key and the text.
```
{
    ...
    "test.text": "I am testing i18n"
    ...
}
```

2. Next you have to register the definitions using `defineMessages` method of `react-intl` module. If this text is going to be used in multiple components then you have to define it in [global-messages.js](https://github.com/Emurgo/yoroi-frontend/blob/develop/app/i18n/global-messages.js) otherwise define it in the target component. Let's assume that our target component is `TestText.js`. We have to modify `TestText.js` like below.
```
// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

const messages = defineMessages({
  testText: {
    id: 'test.text',
    defaultMessage: '!!!I am testing i18n',
  }
});

@observer
export default class TestText extends Component {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    return (<div>{intl.formatMessage(messages.testText)}</div>);
  }
}
```

**WARNING:** If you did not register the definition using `defineMessages` method and try to [Rebuilding language cache](https://github.com/Emurgo/yoroi-frontend/tree/develop/app/i18n#rebuilding-language-cache) then your newly added keys will be deleted.

3. Follow steps of [Rebuilding language cache](https://github.com/Emurgo/yoroi-frontend/tree/develop/app/i18n#rebuilding-language-cache). New key for every locale will be added like below.

[en-US](https://github.com/Emurgo/yoroi-frontend/blob/develop/app/i18n/locales/en-US.json)
```
{
    ...
    "test.text": "I am testing i18n"
    ...
}
```

[AUTO-ADDED] [ja-JP](https://github.com/Emurgo/yoroi-frontend/blob/develop/app/i18n/locales/ja-JP.json)
```
{
    ...
    "test.text": "!!!I am testing i18n"
    ...
}
```

## Rebuilding language cache

After making changes that affect the languages files, please do the following **AFTER** backing up your work (these actions may edit your files in a way you would like to reverse).

1) `npm run purge-translations` (delete translation cache)
2) `npm run build` (rebuild translation cache. Note: you **need** to do this but it doesn't have to be `dev`. Any task that causes a rebuild is fine.)
3) `npm run manage-translations` (check language config for mistakes. Note: auto-fix is dangerous)
