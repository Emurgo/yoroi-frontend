# Actions

`Actions` are meant to decouple state update triggered from UI actions (`components`&`containers`) from the `stores`. To do this, we register a set of `actions` in our application and `stores` listen to those actions. UI components can then `trigger` the action which in turn calls the `store`.

In practice, multiple stores could listen to the same action but in practice these should be a one-to-one relation.
