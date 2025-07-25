class Lazy<T> {
  getValue: () => Promise<T>
  cache: [T] | null = null

  constructor(getValue: () => Promise<T>) {
    this.getValue = getValue;
  }

  async force(self: unknown, shouldCache: boolean): Promise<T> {
    if (this.cache) {
      return this.cache[0]
    }
    const value = await this.getValue.call(self)
    if (shouldCache) {
      this.cache = [value]
    }
    return value
  }

  evict(): void {
    this.cache = null
  }
}

/*
  note that the type of definition of
  ```
  export function lazy(data) {
    return new Lazy(data)
  }
  ```
  is (data: any) => Lazy<any>
*/
export function lazy<T>(func: () => Promise<T>) {
  return new Lazy<T>(func)
}

class MutateFunc {
  func
  self
  constructor(func) {
    this.func = func
  }
  toString() {
    return 'MutateFunc'
  }
}

export function mutateFunc<F extends (...args: any[]) => void | Promise<void>>(
  func: (path: Path, emitChange: (path: Path, newValue?: unknown) => void) => F
): F {
  return new MutateFunc(func) as unknown as F
}

function isPrefix(prefix: Path, path: Path): boolean {
  if (prefix.length > path.length) {
    return false
  }
  for (let i = 0; i < prefix.length; i++) {
    if (!(
      (prefix[i] === path[i]) ||
      (prefix[i] === ALL && typeof path[i] === 'number') ||
      (typeof prefix[i] === 'number' && path[i] === ALL) ||
      (typeof prefix[i] === 'number' && typeof path[i] === 'number')
    )) {
      return false
    }
  }
  return true
}

type Path = (string | symbol | number)[]

type Listener = (event: Event) => void
type Event = {
  type: 'change',
  path: Path,
  newValue?: unknown
}

interface Model {
  getValue(path: Path, options?: { cache: boolean }): Promise<unknown>
  call(path: Path, ...args: unknown[]): Promise<unknown>
  listen(path: Path, callback: Listener): () => void
  dispatchEvent(event: Event): void
}

class AbsentParameter {}

abstract class ModelHelper {
  listeners: { path: Path, callback: Listener }[] = []

  listen(path, callback): () => void {
    this.listeners.push({ path, callback })
    const index = this.listeners.length - 1
    return () => void(this.listeners.splice(index, 1))
  }

  dispatchEvent(event: Event): void {
    for (const listener of this.listeners) {
      if (isPrefix(listener.path, event.path)) {
        listener.callback(event)
      }
    }
  }

  async call(this: Model, path, ...args) {
    const value = await this.getValue(path, { cache: false })

    if (value instanceof MutateFunc) {
      return value.func.call(
        value.self,
        path.slice(0, -1),
        (eventPath, newValue=new AbsentParameter()) => {
          const event: Event = { type: 'change', path: eventPath }
          if (!(newValue instanceof AbsentParameter)) {
            event.newValue = newValue
          }
          this.dispatchEvent(event)
        }
      )(...args)
    } else if (typeof value === 'function') {
      return value(...args)
    } else {
      throw new Error(`path ${JSON.stringify(path)} is not a function but value ${JSON.stringify(value)}`)
    }
  }

}

class BasicModel extends ModelHelper implements Model {
  dataSource: unknown

  constructor(dataSource: unknown) {
    super()
    this.dataSource = dataSource
  }

  dispatchEvent(event: Event): void {
    if (event.type === 'change') {
      // todo: use newValue
      const ROOT_KEY = 'root'
      let value = { [ROOT_KEY]: this.dataSource }
      for (const pathComponent of [ROOT_KEY, ...event.path]) {
        value = value[pathComponent]
        if (value instanceof Lazy) {
          value.evict()
          break
        }
      }
    }
    super.dispatchEvent(event)
  }

  async getValue(
    path,
    options={ cache: false }
  ) {
    const ROOT_KEY = 'root'
    let value = { [ROOT_KEY]: this.dataSource }
    for (const pathComponent of [ROOT_KEY, ...path]) {
      let nextValue = value[pathComponent]

      if (nextValue instanceof Lazy) {
        nextValue = await nextValue.force(value, options.cache)
      } else if (nextValue instanceof MutateFunc) {
        // todo: assert that we are at the terminal
        nextValue.self = value
        return nextValue
      }
      value = nextValue
    }

    const forceRecur = async (obj, parent) => {
      if (obj instanceof Lazy) {
        return forceRecur(await obj.force(parent, options.cache), parent)
      } else if (Array.isArray(obj)) {
        // todo concurrency control
        return Promise.all(obj.map(forceRecur))
      } else if (typeof obj === 'object') {
        const ret = {}
        for (let key in obj) {
          const val = obj[key]
          if (val instanceof MutateFunc) {
            val.self = obj
          } else {
            ret[key] = await forceRecur(val, obj)
          }
        }
        return ret
      } else {
        return obj
      }
    }
    const ret = await forceRecur(value, null/* this is safe because `value` couldn't be a `Lazy`*/)
    return ret
  }

}

class ExtendedProperty {
  deps: Accessor[]
  func: Function

  constructor(deps, func) {
    this.deps = deps
    this.func = func
  }
}
/*
export function extendProperty<FuncT extends (...args: any) => any >(
  deps: Parameters<FuncT>,
  func: FuncT
): ReturnType<Func> {
  return new ExtendedProperty(deps, func)
}
*/
export function extendProperty<ArgsT extends any[], RetT>(
  deps: ArgsT,
  func: (...args: ArgsT) => RetT
): RetT {
  return new ExtendedProperty(deps, func) as unknown as RetT
}

class ExtendedModel extends ModelHelper implements Model {
  path: Path
  extendedModel: Model
  extender: any

  constructor(extendedModel: Model, path: Path, extender) {
    super()
    this.extendedModel = extendedModel
    // ??? assert path = []
    this.path = path
    this.extender = extender
    
    const visitExtenderRecur = (node, extendPath: Path =[]) => {
      if (node instanceof ExtendedProperty) {
        for (const dep of node.deps) {
          const { path } = dep[_GET_ACCESSOR_META]
          this.listen(path, (event) => {
            if (event.type === 'change') {
              // ??? can we more proactively calculuate newValue?
              this.dispatchEvent({ type: 'change', path: extendPath })
            }
          })
        }
      } else if (typeof node === 'object') {
        for (let key in node) {
          visitExtenderRecur(node[key], [...extendPath, key])
        }
      }
    }
    visitExtenderRecur(extender)

    extendedModel.listen(this.path, (event) => {
      // fixme: handle the situation: at event.path extender overrides this.extendedModel
      this.dispatchEvent(event)
    })
  }
  
  async getValue(
    path,
    options={ cache: false }
  ) {
    let extenderValue = this.extender
    for (const pathComponent of path) {
      let newValue = extenderValue[pathComponent]

      if (newValue === undefined && typeof pathComponent === 'number') {
        newValue = extenderValue[ALL]
      }

      if (newValue === undefined) {
        // [...this.path, ...path]?
        return this.extendedModel.getValue(path, options)
      } else {
        extenderValue = newValue
      }
    }

    if (extenderValue instanceof ExtendedProperty) {
      const { deps, func } = extenderValue
      const args: any[] = []
      for (const dep of deps) {
        args.push(await getValue(dep))
      }
      return func(...args)
    } else {
      return extenderValue
    }
  }
}

type RequestServerFunc =  (
  request: { type: 'getValue', path: Path } | { type: 'call', path: Path, args: unknown[] }
) => Promise<unknown>

class ClientModel extends ModelHelper implements Model {
  requestServer: RequestServerFunc
  constructor(requestServer) {
    super()
    this.requestServer = requestServer
  }

  getValue(path) {
    return this.requestServer({ type: 'getValue', path })
  }

  call(path, ...args) {
    return this.requestServer({ type: 'call', path, args })
  }  
}

class CachedValue {
  value: unknown
  constructor(value) {
    this.value = value
  }
  toString() {
    return 'cached value ' + JSON.stringify(this.value)
  }
}

class CacheModel extends ModelHelper implements Model {
  model: Model
  cache: any

  constructor(model: Model) {
    super()
    this.model = model
    this.cache = undefined
    model.listen([], (event) => {
      this.dispatchEvent(event)

      let visit = this;
      // todo: more sophisticated patching when event.newValue is present
      for (let pathComponent of ['cache', ...event.path]) {
        if (visit[pathComponent] instanceof CachedValue) {
          visit[pathComponent] = undefined
          break
        } else {
          visit = visit[pathComponent]
        }
      }
    })
  }

  async getValue(path, options = { cache: true }) {
    if (!options.cache) {
      return await this.model.getValue(path)
    }

    let cache = this.cache
    let setCacheDuo: [Object, string] = [this, 'cache']
    let i = 0
    for (;;) {
      if (cache instanceof CachedValue) {
        break;
      }
      if (i === path.length) {
        break;
      }
      if (cache === undefined) {
        cache = setCacheDuo[0][setCacheDuo[1]] = {}
      }
      const pathComponent = path[i]
      setCacheDuo = [cache, pathComponent]
      cache = cache[pathComponent]

      i++
    }
    if (cache instanceof CachedValue) {
      let value: any = cache.value
      for (let j = i; j < path.length; j++) {
        value = value[path[j]]
      }
      return value
    } else {
      const value = await this.model.getValue(path)
      setCacheDuo[0][setCacheDuo[1]] = new CachedValue(value)
      return value
    }
  }

  call(path: Path, ...args: unknown[]) {
    return this.model.call(path, ...args)
  }
}

export const _GET_ACCESSOR_META = 'cb8686c0-d2b8-4c81-a6ae-837638ed42ee'

type Accessor = {
  [_GET_ACCESSOR_META]: {
    model: Model,
    path: Path
  }
}

function _makeAccessor(
  model: Model,
  path: Path = [],
): any {
  return new Proxy({}, {
    get(_target, prop) {
      if (prop === _GET_ACCESSOR_META) {
        return { model, path }
      } else {
        let p: Path[number] = prop
        if ((typeof prop === 'string' && /^\d+$/.test(prop)) || prop === String(ALL)) {
          p = Number(prop)
        }
        return _makeAccessor(model, [...path, p])
      }
    }
  });
}

type GetUserType<SourceT> =
  SourceT extends Lazy<infer R> ? GetUserType<R> :
  SourceT extends (...args: infer ArgsT) => Promise<infer RetT> ? ((...args: ArgsT) => GetUserType<RetT>) :
  SourceT extends (infer U)[] ? GetUserType<U>[] :
  SourceT extends Object ? { [K in keyof SourceT]: GetUserType<SourceT[K]> } :
  SourceT // todo: be more restrict

export function makeAccessor<T>(
  dataSource: T
): GetUserType<T> {
  return _makeAccessor(
    new BasicModel(dataSource)
  )
}

export function makeClientAccessor<T>(
  requestServer: RequestServerFunc,
): { modelAccessor: T, onServerEvent: (event: Event) => void } {
  const clientModel = new ClientModel(requestServer)
  return {
    modelAccessor: _makeAccessor(clientModel),
    onServerEvent: (event) => clientModel.dispatchEvent(event),
  }
}

export function makeAccessorServer(
  accessor: unknown,
  emitEvent: (event: Event) => void,
) {
  const dispose = listen(accessor, (event) => {
    emitEvent(event)
  });
  const request = (clientRequest) => {
    const { model, path } = (accessor as Accessor)[_GET_ACCESSOR_META]
    const clientRequestAccessor = _makeAccessor(model, [...path, ...clientRequest.path])
    if (clientRequest.type === 'getValue') {
      return getValue(clientRequestAccessor)
    } else if (clientRequest.type === 'call') {
      return call(clientRequestAccessor, ...clientRequest.args)
    } else {
      throw new Error(`unexpected clientRequest ${JSON.stringify(clientRequest)}`)
    }
  }

  return { request, dispose }
}

export async function getValue<T>(
  // must not be a method
  accessor: T extends (...args: any) => any ? never : T,
  options: {
    cache: boolean,
  } = {
    cache: false,
  }
): Promise<T> {
  const { model, path } = accessor[_GET_ACCESSOR_META]
  return model.getValue(path, options)
}

export const ALL = -1;

// todo: explicitly check type
export function listen<T>(
  eventTargetAccessor: T extends (...args: any) => any ? never : T,
  callback: Listener
) {
  const { model, path } = (eventTargetAccessor as Accessor)[_GET_ACCESSOR_META]
  model.listen(path, callback)
}

export function call<F extends (...args: any) => any>(
  accessor: F,
  ...args: Parameters<F>
): Promise<ReturnType<F>> {
  // todo: local call
  const { model, path } = accessor[_GET_ACCESSOR_META]
  return model.call(path, ...args)
}


type ExtendObjs<O1, O2> = BetterPrint<{
  [K in ((keyof O1) | (keyof O2))]:
    K extends keyof O1 ?
      K extends keyof O2 ?    
        BetterPrint<ExtendObjs<O1[K], O2[K]>> :
        O1[K] :
      K extends keyof O2 ?
        O2[K] :
        never // impossible to reach
}>

type BetterPrint<T> = T extends infer O
  ? { [P in keyof O]: O[P] }
  : never;

export function extend<UserType, ExtenderType>(
  accessor: UserType,
  extender: ExtenderType,
): ExtendObjs<UserType, GetUserType<ExtenderType>> {
  const { model, path } = accessor[_GET_ACCESSOR_META]
  const extendedAccessor = _makeAccessor(
    new ExtendedModel(model, path, extender)
  )

  const installChangesRecur = (visit, extendPath: Path = []) => {
    if (visit instanceof ExtendedProperty) {
      for (const dep of visit.deps) {
        //console.log('%s => %s', dep[_GET_ACCESSOR_META].path, [...path, ...extendPath])
        listen(dep, (event) => {
          extendedAccessor[_GET_ACCESSOR_META].model.dispatchEvent({
            ...event,
            path: [...path, ...extendPath],
          })
        })
      }
    } else if (visit.constructor === Object ) {
      for (let k in visit) {
        const key = (k === String(ALL)) ? ALL : k
        installChangesRecur(visit[key], [...extendPath, key])
      }
    }
  }
  installChangesRecur(extender)
  return extendedAccessor
}

export function cache<T>(accessor: T): T {
  const { model, path } = accessor[_GET_ACCESSOR_META]
  const cacheModel = new CacheModel(model)
  return _makeAccessor(cacheModel, path)
}
