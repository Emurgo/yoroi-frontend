declare type $Inexact<T: Object> = {...T};
declare type ExtractReturnType = <R>((...arg: any) => R) => R;
declare type ReturnType<Func> = $Call<ExtractReturnType, Func>;

declare type ExtractPromisslessReturnType = <R>((...arg: any) => Promise<R>) => R;
declare type PromisslessReturnType<Func> = $Call<ExtractPromisslessReturnType, Func>;

/* eslint-disable no-redeclare */
declare function arguments<A>(() => any): []
declare function arguments<A>((A) => any): [A]
declare function arguments<A, B>((A, B) => any): [A, B]
declare function arguments<A, B, C>((A, B, C) => any): [A, B, C]
declare function arguments<A, B, C, D>((A, B, C, D) => any): [A, B, C, D]
declare function arguments<A, B, C, D, E>((A, B, C, D, E) => any): [A, B, C, D, E]
declare type Arguments<T: Function> = $Call<typeof arguments, T>;
