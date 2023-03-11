export interface UntypeableBase<TLevels extends readonly string[] = []> {
  addLevel: <TLevel extends string>() => UntypeableBase<[...TLevels, TLevel]>;
  router: () => UntypeableRouter<TLevels>;
  input: <TInput>() => UntypeableInput<TInput>;
  output: <TOutput>() => UntypeableOutput<{}, TOutput>;
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
  TLevels extends readonly string[] = [],
  TRoutes extends Record<string, any> = {},
> {
  add: <
    TPath extends string,
    TConfig extends StringArrayToObject<TLevels, UntypeableOutput<any, any>>,
  >(
    path: TPath,
    config?: TConfig,
  ) => UntypeableRouter<TLevels, Prettify<TRoutes & Record<TPath, TConfig>>>;

  handler: (
    handler: LooseUntypeableHandler<TLevels>,
  ) => UntypeableHandler<TLevels, TRoutes>;
  merge: <TRoutes2 extends Record<string, any>>(
    router: UntypeableRouter<TLevels, TRoutes2>,
  ) => UntypeableRouter<TLevels, Prettify<TRoutes & TRoutes2>>;
}

export type LooseUntypeableHandler<TLevels extends readonly string[]> = (
  ...args: [path: string, ...levels: TLevels, input: any]
) => Promise<any>;

export type UntypeableHandler<
  TLevels extends readonly string[] = [],
  TRoutes extends Record<string, any> = {},
> = TLevels["length"] extends 0
  ? <T1 extends keyof TRoutes>(
      path: T1,
      ...args: ArgsFromConfig<TRoutes[T1]>
    ) => TRoutes[T1] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : TLevels["length"] extends 1
  ? <T1 extends keyof TRoutes, T2 extends keyof TRoutes[T1]>(
      path: T1,
      firstLevel: T2,
      ...args: ArgsFromConfig<TRoutes[T1][T2]>
    ) => TRoutes[T1][T2] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : TLevels["length"] extends 2
  ? <
      T1 extends keyof TRoutes,
      T2 extends keyof TRoutes[T1],
      T3 extends keyof TRoutes[T1][T2],
    >(
      path: T1,
      firstLevel: T2,
      secondLevel: T3,
      ...args: ArgsFromConfig<TRoutes[T1][T2][T3]>
    ) => TRoutes[T1][T2][T3] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : TLevels["length"] extends 3
  ? <
      T1 extends keyof TRoutes,
      T2 extends keyof TRoutes[T1],
      T3 extends keyof TRoutes[T1][T2],
      T4 extends keyof TRoutes[T1][T2][T3],
    >(
      path: T1,
      firstLevel: T2,
      secondLevel: T3,
      thirdLevel: T4,
      ...args: ArgsFromConfig<TRoutes[T1][T2][T3][T4]>
    ) => TRoutes[T1][T2][T3][T4] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : never;

export type ArgsFromConfig<TConfig> = TConfig extends UntypeableOutput<
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

export type LevelsFromRouter<TRouter extends UntypeableRouter<any, any>> =
  TRouter extends UntypeableRouter<infer TLevels, any> ? TLevels : never;

export type ConfigFromRouter<TRouter extends UntypeableRouter<any, any>> =
  TRouter extends UntypeableRouter<any, infer TConfig> ? TConfig : never;
