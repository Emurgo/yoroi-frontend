# Idea

Refactor the app, use newer dependencies, improve code quality

# Motivation

Currently there are some things in the project which make working with it a bit too hard. The project structure could be better, the routing could be better, we could use the latest react-router and react and that could help a lot.


# Proposal

- update dependencies: react-router 4 instead of 3, React 16 instead of 15

Basically the routing in react-router 4 is more handy and allows to work with it with less effort. As for React 16, there are some useful things - for example, `<Fragment />` component, it can be used to avoid wrapping multiple JSX elements in the unnecessary `<div />`. Also there are new lifecycle methods in React 16, and the React team works on the optimisation, so this can be useful.

- update routing

Currently the routing breaks DRY principle. There are just a lot of repeated things in each route. This appearance makes code hard to read and understand. Also if we need to add a new route, we have to repeat all these previously repeated things for a new route too.

- use Mobx Provider in a proper way

We don't have a possibility to access store or actions from any component without it's own route. That's because there are no Provider wrapping the routes, only the IntlProvider, so we can see the current locale etc, but nothing more. Unfortunately, we can have some cases when we want to see store from the deeply nested component. As for now, this primitive thing requires a lot of repeated code, and more unnecessary code can accidentally bring more bugs. Also it's harder to maintain the project, to fix bugs or implement more features, and it would be so much heavier to new team members (if some) to understand the code.

- fix the structure

For now, the MainLayout component is used in most containers - they return the content wrapped in the MainLayout, and it happens in most cases. We could just wrap the routing in the MainLayout so we will achieve the same result but without breaking DRY principle. Again, for now it's a lot of really unnecessary code, with all it's cons. There can be some more issues with the structure, but this one is probably the main one.

- additional: switch from Mobx to Redux

Need to check if Redux has something to work with Intl, and if it does, we can use it - probably with Redux-sagas, which have a very neat syntax, very easy to test and which simplify a lot working with async actions and other side effects.
