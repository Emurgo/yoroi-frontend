// flow-typed signature: 6a1142155fc2acc8167dc3de2c224b6c
// flow-typed version: <<STUB>>/mixwith_v0.1.1/flow_v0.98.1

/**
 * By Sebastien Guillemot (https://github.com/SebastienGllmt)
 */

type MixinFunction<I, O> = (superclass: Class<I>) => Class<I & O>;

declare module 'mixwith' {
  declare export function apply<I, O>(
    superclass: Class<I>,
    mixin: MixinFunction<I, O>
  ): Class<I & O>;
  declare export function isApplicationOf<I, O>(
    proto: O,
    mixin: MixinFunction<I, O>
  ): boolean;
  declare export function hasMixin<I, O>(
    o: O,
    mixin: MixinFunction<I, O>
  ): boolean;
  declare export function wrap<I, O>(
    mixin: MixinFunction<I, O>,
    wrapper: MixinFunction<I, O>
  ): MixinFunction<I, O>;
  declare export function unwrap<I, O>(
    wrapper: MixinFunction<I, O>,
  ): MixinFunction<I, O>;
  declare export function Cached<I, O>(
    mixin: MixinFunction<I, O>,
  ): MixinFunction<I, O>;
  declare export function DeDupe<I, O>(
    mixin: MixinFunction<I, O>,
  ): MixinFunction<I, O>;
  declare export function HasInstance<I, O>(
    mixin: MixinFunction<I, O>,
  ): MixinFunction<I, O>;
  declare export function BareMixin<I, O>(
    mixin: MixinFunction<I, O>,
  ): MixinFunction<I, O>;
  declare export function Mixin<I, O>(
    mixin: MixinFunction<I, O>,
  ): <T:I>(superclass: Class<T>) => Class<T & O>;
  declare export function mix<T>(
    superclass: Class<T>,
  ): MixinBuilder<T>;

  declare export class MixinBuilder<T> {
    constructor(superclass: Class<T>): MixinBuilder<T>;

    with: <K>(...mixins: Array<MixinFunction<T, K>>) => Class<T & K>;
  }
}
