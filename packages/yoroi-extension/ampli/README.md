The coerce the TypeScript Amplitude wrapper to work with flow, do these:

```
npm run metrics:pull
```

```
cd ampli
```


```
npx -p typescript tsc index.ts  --outDir . -d -m es6
```

```
npx flowgen --interface-records --no-inexact --add-flow-header -o index.js.flow index.d.ts
```

```
sed -i  's/amplitude\.Types\.\w*/any/' index.js.flow
sed -i '/export type BaseEvent/d' index.js.flow

```

Edit `ampli.js.flow` to add the line `class BaseEvent {}`.

Then we have flow-typed ampli library where all event trigger functions are strongly typed.
To use this libray, import like this from source code:
```
import type { LoadOptionsWithEnvironment } from '../../../ampli/index';
```
instead of
```
import type { LoadOptionsWithEnvironment } from '../../../ampli';
```
Due to perhaps a bug in flow, the later short-circuits type checking.

