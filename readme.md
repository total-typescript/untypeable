# Untypeable

Get type-safe access to any API, with a zero-bundle size option.

## The Problem

If you're lucky enough to use [tRPC](https://trpc.io/), [GraphQL](https://graphql.org/), or [OpenAPI](https://www.openapis.org/), you'll be able to get **type-safe access to your API** - either through a type-safe RPC or codegen.

But **what about the rest of us**?

What do you do if **your API has no types**?

## Solution

Enter `untypeable` - a first-class library for typing API's you don't control.

- 🚀 Get **autocomplete on your entire API**, without needing to set up a single generic function.
- 💪 **Simple to configure**, and extremely **flexible**.
- 🤯 Choose between two modes:
  - **Zero bundle-size**: use `import type` to ensure `untypeable` adds nothing to your bundle.
  - **Strong types**: integrates with libraries like [Zod](https://zod.dev/) to add runtime safety to the types.
- ✨ **Keep things organized** with helpers for merging and combining your config.
- ❤️ You bring the fetcher, we bring the types. There's **no hidden magic**.

## Quickstart

`npm i untypeable`

```ts
import { initUntypeable, createTypeLevelClient } from "untypeable";

// Initialize untypeable
const u = initUntypeable();

type User = {
  id: string;
  name: string;
};

// Create a router
// - Add typed inputs and outputs
const router = u.router({
  "/user": u.input<{ id: string }>().output<User>(),
});

const BASE_PATH = "http://localhost:3000";

// Create your client
// - Pass any fetch implementation here
const client = createTypeLevelClient<typeof router>((path, input) => {
  return fetch(BASE_PATH + path + `?${new URLSearchParams(input)}`).then(
    (res) => res.json(),
  );
});

// Type-safe data access!
// - user is typed as User
// - { id: string } must be passed as the input
const user = await client("/user", {
  id: "1",
});
```

## Zero-bundle mode

You can set up `untypeable` to run in zero-bundle mode. This is great for situations where you trust the API you're calling, but it just doesn't have types.

To set up zero-bundle mode, you'll need to:

1. Define your router in a file called `router.ts`.
2. Export the type of your router: `export type MyRouter = typeof router;`

```ts
// router.ts

import { initUntypeable } from "untypeable";

const u = initUntypeable();

type User = {
  id: string;
  name: string;
};

const router = u.router({
  "/user": u.input<{ id: string }>().output<User>(),
});

export type MyRouter = typeof router;
```

3. In a file called `client.ts`, import `createTypeLevelClient` from `untypeable/type-level-client`.

```ts
// client.ts

import { createTypeLevelClient } from "untypeable/client";
import type { MyRouter } from "./router";

export const client = createTypeLevelClient<MyRouter>(() => {
  // your implementation...
});
```

### How does this work?

This works because `createTypeLevelClient` is just an identity function, which directly returns the function you pass it. Most modern bundlers are smart enough to [collapse identity functions](https://github.com/evanw/esbuild/pull/1898) and erase type imports, so you end up with:

```ts
// client.ts

export const client = () => {
  // your implementation...
};
```

## Runtime-safe mode

Sometimes, you just don't trust the API you're calling. In those situations, you'll often like to _validate_ the data you get back.

`untypeable` offers first-class integration with [Zod](https://zod.dev). You can pass a Zod schema to `u.input` and `u.output` to ensure that these values are validated with Zod.

```ts
import { initUntypeable, createSafeClient } from "untypeable";
import { z } from "zod";

const u = initUntypeable();

const router = u.router({
  "/user": u
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
});

export const client = createSafeClient(router, () => {
  // Implementation...
});
```

Now, every call made to client will have its `input` and `output` verified by the zod schemas passed.

## Configuration & Arguments

`untypeable` lets you be extremely flexible with the shape of your router.

Each level of the router corresponds to an argument that'll be passed to your client.

```ts
// A router that looks like this:
const router = u.router({
  github: {
    "/repos": {
      GET: u.output<string[]>(),
      POST: u.output<string[]>(),
    },
  },
});

const client = createTypeLevelClient<typeof router>(() => {});

// Will need to be called like this:
client("github", "/repos", "POST");
```

You can set up this argument structure using the methods below:

### `.pushArg`

Using the `.pushArg` method when we `initUntypeable` lets us add new arguments that must be passed to our client.

```ts
import { initUntypeable, createTypeLevelClient } from "untypeable";

// use .pushArg to add a new argument to
// the router definition
const u = initUntypeable().pushArg<"GET" | "POST" | "PUT" | "DELETE">();

type User = {
  id: string;
  name: string;
};

// You can now optionally specify the
// method on each route's definition
const router = u.router({
  "/user": {
    GET: u.input<{ id: string }>().output<User>(),
    POST: u.input<{ name: string }>().output<User>(),
    DELETE: u.input<{ id: string }>().output<void>(),
  },
});

// The client now takes a new argument - method, which
// is typed as 'GET' | 'POST' | 'PUT' | 'DELETE'
const client = createTypeLevelClient<typeof router>((path, method, input) => {
  let resolvedPath = path;
  let resolvedInit: RequestInit = {};

  switch (method) {
    case "GET":
      resolvedPath += `?${new URLSearchParams(input as any)}`;
      break;
    case "DELETE":
    case "POST":
    case "PUT":
      resolvedInit = {
        method,
        body: JSON.stringify(input),
      };
  }

  return fetch(resolvedPath, resolvedInit).then((res) => res.json());
});

// This now needs to be passed to client, and
// is still beautifully type-safe!
const result = await client("/user", "POST", {
  name: "Matt",
});
```

You can call this as many times as you want!

```ts
const u = initUntypeable()
  .pushArg<"GET" | "POST" | "PUT" | "DELETE">()
  .pushArg<"foo" | "bar">();

const router = u.router({
  "/": {
    GET: {
      foo: u.output<string>,
    },
  },
});
```

### `.unshiftArg`

You can also add an argument at the _start_ using `.unshiftArg`. This is useful for when you want to add different base endpoints:

```ts
const u = initUntypeable().unshiftArg<"github", "youtube">();

const router = u.router({
  github: {
    "/repos": u.output<{ repos: { id: string }[] }>(),
  },
});
```

### `.args`

Useful for when you want to set the args up manually:

```ts
const u = initUntypeable().args<string, string, string>();

const router = u.router({
  "any-string": {
    "any-other-string": {
      "yet-another-string": u.output<string>(),
    },
  },
});
```

## Organizing your routers

### `.add`

You can add more detail to a router, or split it over multiple calls, by using `router.add`.

```ts
const router = u
  .router({
    "/": u.output<string>(),
  })
  .add({
    "/user": u.output<User>(),
  });
```

### `.merge`

You can merge two routers together using `router.merge`. This is useful for when you want to combine multiple routers (perhaps in different modules) together.

```ts
import { userRouter } from "./userRouter";
import { postRouter } from "./postRouter";

export const baseRouter = userRouter.merge(postRouter);
```
