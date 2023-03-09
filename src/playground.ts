// Features we want:
// Merging
// Creating generic functions from configs
// Creating configs with multiple nesting

interface UntypeableBase<TLevels extends readonly string[] = []> {
  addLevel: <TLevel extends string>() => UntypeableBase<[...TLevels, TLevel]>;
  router: () => UntypeableRouter<TLevels>;
  input: <TInput>() => UntypeableInput<TInput, void>;
  output: <TOutput>() => UntypeableOutput<void, TOutput>;
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

interface UntypeableInput<TInput, TOutput> {
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

  handler: () => <
    TPath extends keyof TRoutes,
    TArgsWithReturn extends RoutesToHandlerArgsAndReturn<
      TRoutes[TPath]
    > extends infer X extends any[]
      ? X
      : never,
  >(
    ...args: [
      path: TPath,
      ...args: TArgsWithReturn extends [...infer TArgs, any] ? TArgs : never,
    ]
  ) => TArgsWithReturn extends [...any[], infer TReturn] ? TReturn : never;
}

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
  .add("/user/:id/update", u1.input<{ name: string }>().output<User>());

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

type RoutesToHandlerArgsAndReturn<
  Routes,
  TArgs extends readonly any[] = [],
> = Routes extends UntypeableOutput<infer TInput, infer TOutput>
  ? TInput extends void
    ? [...args: TArgs, output: TOutput]
    : [...args: TArgs, input: TInput, output: TOutput]
  : Routes extends Record<string, any>
  ? {
      [K in keyof Routes]: RoutesToHandlerArgsAndReturn<
        Routes[K],
        [...args: TArgs, arg: K]
      >;
    }[keyof Routes]
  : [];

const handler = userRouter.handler();

handler("/user/:id", "PUT", {
  name: "awdawd",
  orgId: "awdawd",
});

const basicHandler = basicRouter.handler();

basicHandler("/user/:id");
