// Features we want:
// Merging
// Creating generic functions from configs
// Creating configs with multiple nesting

interface UntypeableBase<TLevels extends readonly string[] = []> {
  addLevel: <TLevel extends string>() => UntypeableBase<[...TLevels, TLevel]>;
  router: () => UntypeableRouter<TLevels>;
  input: <TInput>() => UntypeableInput<TInput>;
  output: <TOutput>() => UntypeableOutput<{}, TOutput>;
}

type Pop<L extends ReadonlyArray<any>> = L extends
  | readonly [...infer LBody, any]
  | readonly [...infer LBody, any?]
  ? LBody
  : L;

type _Split<S extends string, D extends string = ""> = D extends ""
  ? Pop<__Split<S, D>>
  : __Split<S, D>;

type Cast<A1 extends any, A2 extends any> = A1 extends A2 ? A1 : A2;

type __Split<
  S extends string,
  D extends string,
  T extends string[] = [],
> = S extends `${infer BS}${D}${infer AS}`
  ? __Split<AS, D, [...T, BS]>
  : [...T, S];

type Split<S extends string, D extends string = ""> = _Split<
  S,
  D
> extends infer X
  ? Cast<X, string[]>
  : never;

type ExtractPathParams<TPath extends string> = {
  [K in Split<TPath, "/">[number] as K extends `:${infer P}`
    ? P
    : never]: string;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

interface UntypeableInput<TInput> {
  __type: "input";
  output: <TOutput>() => UntypeableOutput<TInput, TOutput>;
}

interface UntypeableOutput<TInput, TOutput> {
  __type: "output";
}

interface UntypeableRouter<
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

  handler: () => UntypeableHandler<TLevels, TRoutes>;
  merge: <TRoutes2 extends Record<string, any>>(
    router: UntypeableRouter<TLevels, TRoutes2>,
  ) => UntypeableRouter<TLevels, Prettify<TRoutes & TRoutes2>>;
}

type UntypeableHandler<
  TLevels extends readonly string[] = [],
  TRoutes extends Record<string, any> = {},
> = TLevels["length"] extends 0
  ? <T1 extends keyof TRoutes>(
      path: T1,
      ...args: ArgsFromConfig<T1 & string, TRoutes[T1]>
    ) => TRoutes[T1] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : TLevels["length"] extends 1
  ? <T1 extends keyof TRoutes, T2 extends keyof TRoutes[T1]>(
      path: T1,
      firstLevel: T2,
      ...args: ArgsFromConfig<T1 & string, TRoutes[T1][T2]>
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
      ...args: ArgsFromConfig<T1 & string, TRoutes[T1][T2][T3]>
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
      ...args: ArgsFromConfig<T1 & string, TRoutes[T1][T2][T3][T4]>
    ) => TRoutes[T1][T2][T3][T4] extends UntypeableOutput<any, infer TOutput>
      ? Promise<TOutput>
      : never
  : never;

type ArgsFromConfig<
  TPath extends string,
  TConfig,
  PathParams = ExtractPathParams<TPath>,
> = TConfig extends UntypeableOutput<infer TInput, any>
  ? TInput & PathParams extends Record<string, never>
    ? []
    : [input: Prettify<TInput & PathParams>]
  : never;

// interface UntypeableHandler<
//   TLevels extends readonly string[] = [],
//   TRoutes extends Record<string, any> = {},
// > {
//   <T1 extends keyof TRoutes>(
//     path: T1,
//     input: TRoutes[T1] extends UntypeableOutput<infer TInput, any>
//       ? TInput
//       : never,
//   ): TRoutes[T1] extends UntypeableOutput<any, infer TOutput>
//     ? Promise<TOutput>
//     : never;
//   <T1 extends keyof TRoutes, T2 extends keyof TRoutes[keyof TRoutes]>(
//     path: T1,
//     firstLevel: T2,
//     input: TRoutes[T1][T2] extends UntypeableOutput<infer TInput, any>
//       ? TInput extends void
//         ? []
//         : [input: TInput]
//       : never,
//   ): TRoutes[T1][T2] extends UntypeableOutput<any, infer TOutput>
//     ? Promise<TOutput>
//     : never;
// }

type StringArrayToObject<T extends readonly string[], TValue> = T extends [
  infer THead extends string,
  ...infer TTail extends readonly string[],
]
  ? { [K in THead]?: StringArrayToObject<TTail, TValue> }
  : TValue;

const initUntypeable = () => {
  return {} as UntypeableBase;
};

type User = {
  id: string;
  name: string;
};

const u1 = initUntypeable();

const basicRouter = u1
  .router()
  .add("/user/:id", u1.output<User>())
  .add("/create-user", u1.input<{ name: string }>().output<User>())
  .add("/user/:id/update", u1.input<{ name: string }>().output<User>())
  .add("/delete-user/:id", u1.output<boolean>());

const u = initUntypeable().addLevel<"GET" | "POST" | "PUT" | "DELETE">();

const userRouter = u
  .router()
  .add("/user/:id", {
    GET: u.output<User>(),
    PUT: u.input<{ name: string; orgId: string }>().output<User>(),
    DELETE: u.output<boolean>(),
  })
  .add("/user", {
    POST: u.input<{ name: string }>().output<User>(),
  });

const postRouter = u
  .router()
  .add("/post/:id", {
    GET: u.output<User>(),
    PUT: u.input<{ name: string; orgId: string }>().output<User>(),
    DELETE: u.output<boolean>(),
  })
  .add("/post", {
    POST: u.input<{ name: string }>().output<User>(),
  });

const handler = userRouter.merge(postRouter).handler();

handler("/user/:id", "PUT", {
  id: "awdawd",
  name: "awdawd",
  orgId: "awdawd",
});

handler("/user", "POST", {
  id: "124123",
  name: "awdawd",
  orgId: "awdawd",
});

const basicHandler = basicRouter.handler();

basicHandler("/create-user", {
  name: "awdawd",
});

basicHandler("/user/:id", {
  id: "awdawd",
});

basicHandler("/user/:id/update", {
  id: "awdawd",
  name: "awdawd",
});

basicHandler("/delete-user/:id", {
  id: "124123",
});

const u3 = initUntypeable()
  .addLevel<"WOW" | "WOW2">()
  .addLevel<"AMAZING" | "EPIC">()
  .addLevel<"MUST" | "GO" | "DEEPER">();

const deepRouter = u3.router().add("/deep", {
  WOW: {
    AMAZING: {
      DEEPER: u3.output<string>(),
      GO: u3.output<number>(),
      MUST: u3.output<string>(),
    },
  },
});

const deepHandler = deepRouter.handler();

const result = deepHandler("/deep", "WOW", "AMAZING", "GO");
