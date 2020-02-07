// @flow

declare type InexactSubset<T: {...}> = $Rest<T, {...}>;
declare type Inexact<T: {...}> = { ...T, ... };

declare type ExtractReturnType = <R>((...arg: any) => R) => R;
declare type ReturnType<Func> = $Call<ExtractReturnType, Func>;

declare type ExtractPromisslessReturnType = <R>((...arg: any) => Promise<R>) => R;
declare type PromisslessReturnType<Func> = $Call<ExtractPromisslessReturnType, Func>;

declare type ExtractInstance = <T>(Class<T>) => T;
declare type InstanceOf<ClassType> = $Call<ExtractInstance, ClassType>;

declare type ExtractElement = <T>(Array<T>) => T;
declare type ElementOf<ArrayType> = $Call<ExtractElement, ArrayType>;

declare type AddToArray<ArrayType, Field> = Array<ElementOf<ArrayType> & Field>;

declare type ToSchemaProp = <K, V>(K, V) => K;

declare type Nullable = <K>(K) => null | K;
declare type WithNullableFields<T: {...}> = $ObjMap<T, Nullable>;

declare type PossiblyAsync<T> = T | Promise<T>;

/* eslint-disable no-redeclare */
declare function arguments<A>(() => any): []
declare function arguments<A>((A) => any): [A]
declare function arguments<A, B>((A, B) => any): [A, B]
declare function arguments<A, B, C>((A, B, C) => any): [A, B, C]
declare function arguments<A, B, C, D>((A, B, C, D) => any): [A, B, C, D]
declare function arguments<A, B, C, D, E>((A, B, C, D, E) => any): [A, B, C, D, E]
declare type Arguments<T: Function> = $Call<typeof arguments, T>;
