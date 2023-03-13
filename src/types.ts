type DefaultArgs = [string];

export type AcceptedParser<T> =
  | ((input: unknown) => T)
  | {
      parse: (input: unknown) => T;
    };

export interface UntypeableBase<TArgs extends readonly string[] = DefaultArgs> {
  pushArg: <TArg extends string>() => UntypeableBase<[...TArgs, TArg]>;
  unshiftArg: <TArg extends string>() => UntypeableBase<[TArg, ...TArgs]>;
  args<TArg1 extends string>(): UntypeableBase<[TArg1]>;
  args<TArg1 extends string, TArg2 extends string>(): UntypeableBase<
    [TArg1, TArg2]
  >;
  args<
    TArg1 extends string,
    TArg2 extends string,
    TArg3 extends string,
  >(): UntypeableBase<[TArg1, TArg2, TArg3]>;
  args<
    TArg1 extends string,
    TArg2 extends string,
    TArg3 extends string,
    TArg4 extends string,
  >(): UntypeableBase<[TArg1, TArg2, TArg3, TArg4]>;
  args<TArgs extends readonly string[]>(): UntypeableBase<TArgs>;
  router: () => UntypeableRouter<TArgs>;
  input: <TInput>(parser?: AcceptedParser<TInput>) => UntypeableInput<TInput>;
  output: <TOutput>(
    parser?: AcceptedParser<TOutput>,
  ) => UntypeableOutput<{}, TOutput>;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface UntypeableInput<TInput> {
  __type: "input";
  output: <TOutput>() => UntypeableOutput<TInput, TOutput>;
}

export interface UntypeableOutput<TInput, TOutput> {
  __type: "output";
}

export interface UntypeableRouter<
  TArgs extends readonly string[] = DefaultArgs,
  TRoutes extends Record<string, any> = {},
> {
  add: <
    TNewRoutes extends StringArrayToObject<TArgs, UntypeableOutput<any, any>>,
  >(
    routes: TNewRoutes,
  ) => UntypeableRouter<TArgs, Prettify<TRoutes & TNewRoutes>>;

  handler: (
    handler: LooseUntypeableHandler<TArgs>,
  ) => UntypeableHandler<TArgs, TRoutes>;
  merge: <TRoutes2 extends Record<string, any>>(
    router: UntypeableRouter<TArgs, TRoutes2>,
  ) => UntypeableRouter<TArgs, Prettify<TRoutes & TRoutes2>>;
}

export type LooseUntypeableHandler<TArgs extends readonly string[]> = (
  ...args: [...args: TArgs, input: any]
) => Promise<any>;

export type UntypeableHandler<
  TArgs extends readonly string[] = DefaultArgs,
  TRoutes extends Record<string, any> = {},
> = TArgs["length"] extends 1
  ? <T1 extends keyof TRoutes>(
      firstArg: T1,
      ...args: ArgsFromRoutes<TRoutes[T1]>
    ) => TRoutes[T1] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : TArgs["length"] extends 2
  ? <T1 extends keyof TRoutes, T2 extends keyof TRoutes[T1]>(
      firstArg: T1,
      secondArg: T2,
      ...args: ArgsFromRoutes<TRoutes[T1][T2]>
    ) => TRoutes[T1][T2] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : TArgs["length"] extends 3
  ? <
      T1 extends keyof TRoutes,
      T2 extends keyof TRoutes[T1],
      T3 extends keyof TRoutes[T1][T2],
    >(
      firstArg: T1,
      secondArg: T2,
      thirdArg: T3,
      ...args: ArgsFromRoutes<TRoutes[T1][T2][T3]>
    ) => TRoutes[T1][T2][T3] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : TArgs["length"] extends 4
  ? <
      T1 extends keyof TRoutes,
      T2 extends keyof TRoutes[T1],
      T3 extends keyof TRoutes[T1][T2],
      T4 extends keyof TRoutes[T1][T2][T3],
    >(
      firstArg: T1,
      secondArg: T2,
      thirdArg: T3,
      fourthArg: T4,
      ...args: ArgsFromRoutes<TRoutes[T1][T2][T3][T4]>
    ) => TRoutes[T1][T2][T3][T4] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : never;

export type ArgsFromRoutes<TRoutes> = TRoutes extends UntypeableOutput<
  infer TInput,
  any
>
  ? TInput extends Record<string, never>
    ? []
    : [input: Prettify<TInput>]
  : never;

export type StringArrayToObject<
  T extends readonly string[],
  TValue,
> = T extends [
  infer THead extends string,
  ...infer TTail extends readonly string[],
]
  ? { [K in THead]?: StringArrayToObject<TTail, TValue> }
  : TValue;

export type ArgsFromRouter<TRouter extends UntypeableRouter<any, any>> =
  TRouter extends UntypeableRouter<infer TArgs, any> ? TArgs : never;

export type RoutesFromRouter<TRouter extends UntypeableRouter<any, any>> =
  TRouter extends UntypeableRouter<any, infer TRoutes> ? TRoutes : never;
