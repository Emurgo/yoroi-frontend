Handle messages from Yoroi extension pages, including connector.

### How to define an endpoint:

1. Define the handler using the template:


```
// @flow
import type { HandlerType } from './type';

type Request = {|
  ...
|};
type Response = {|
  ...
|};

export const Handler: HandlerType<Request, Response> = Object.freeze({
  typeTag: TYPE_TAG,

  // the background script calls this function to handle the request
  handle: async (request) => {
  },
});
```


2. Register the handler in `./index.js`.


3. Define the entry point function in `api/thunk.js`.



